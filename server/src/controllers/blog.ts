import 'reflect-metadata';

import { Response } from 'express';
import { File } from '@prisma/client';
import prisma from '../utils/db';
import logger from '../utils/logger';
import { validationResult } from 'express-validator';
import { RequestProps, PaginationQuery } from '../types';

type PostBody = {
  title: string;
  content: string;
}

export const getPosts = (_req: RequestProps<{}, PaginationQuery>, res: Response) => {
  return res.status(200).send(res.locals.paginated);
};

export const addPost = async (req: RequestProps<PostBody, {}>, res: Response) => {
  try {
    const { id: userId } = res.locals.payload;
    const { title, content } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ details: errors.array() });
    }

    
    let requestFiles = req.files as Express.Multer.File[] | undefined;
    let files: Array<Pick<File, "filename"|"path"|"mimetype"|"size">> = [];
    if (requestFiles) {
      files = requestFiles.map(file => {
        console.log(file);
        const { filename, mimetype, size, path } = file;
        return { filename, path, mimetype, size: BigInt(size) }
      });
    }

    // Prisma doesn't allow nested create statements (user->posts->files)
    // as a workaround, we creta posts and then find the most recent one
    // to add files to this post
    const insertData = await prisma.user.update({
      where: { id: userId },
      data: {
        posts: { create: { title, content } },
      },
      include: { posts: true }
    });

    if (files.length) {
      // looking for the most recently created post
      const lastPost = insertData.posts.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      // adding files to this post
      await prisma.post.update({
        where: { id: lastPost.id},
        data: {
          files: {
            createMany: {
              data: files
            }
          },
        }
      });
    }
    // TODO: Raw SQL should be used instead for above operations

    return res.status(200).send();
  } catch (e) {
    logger.info(e);
    return res.status(500).send({ details: e.message });
  }
};

export const patchPost = async (req: RequestProps<PostBody, {id: number}>, res: Response) => {
  try {
    let { id: postId } = req.query;
    postId = Number(postId);
    const { title, content } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ details: errors.array() });
    }

    await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
      },
    });

    return res.status(200).send();
  } catch (e) {
    logger.info(e);
    return res.status(500).send({ details: e.message });
  }
};



export const deletePost = async (req: RequestProps<{}, { id: number }>, res: Response) => {
  try {
    let { id: postId } = req.query;
    postId = Number(postId);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ details: errors.array() });
    }

    await prisma.post.delete({
      where: { id: postId }
    });

    return res.status(200).send();
  } catch (e) {
    logger.info(e);
    return res.status(500).send({ details: e.message });
  }
};
