import { PrismaClient } from '@prisma/client';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var, vars-on-top, no-unused-vars
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma
  || new PrismaClient({
    log: [],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
