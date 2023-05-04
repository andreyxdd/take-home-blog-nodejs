import { axiosAuthInstance, handleError } from './index';
import { PostProps } from '../types';

type GetPostsProps = {
  data: Array<PostProps>;
  totalPages: number;
}
export const getPosts = async (page: number, limit = 20) => {
  try {
    const { data }: { data: GetPostsProps } = await axiosAuthInstance.get(
      'http://localhost:4000/api/blog/posts',
      { params: { page, limit } },
    );
    return data;
  } catch (error: any) {
    handleError(error);
    return { data: [] as Array<PostProps>, totalPages: 0 };
  }
};

export const deletePost = async (postId: number): Promise<boolean> => {
  try {
    await axiosAuthInstance.delete(
      `${process.env.API_URL}/api/blog/post`,
      { params: { id: postId } },
    );
    return true;
  } catch (error: any) {
    handleError(error);
    return false;
  }
};
