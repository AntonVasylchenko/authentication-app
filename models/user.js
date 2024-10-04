import bcrypt from "bcrypt";
import { PrismaClient } from '@prisma/client';

const userModel = new PrismaClient().$extends({
    query: {
        user: {
            async create({ args, query }) {
                const password = args.data.password;
                const salt = await bcrypt.genSalt(10);
                args.data.password = await bcrypt.hash(password, salt);
                return query(args)
            },
            async update({ args, query }) {
                const password = args.data.password;
                const salt = await bcrypt.genSalt(10);
                args.data.password = await bcrypt.hash(password, salt);
                return query(args)
            }
        }
    },
    result: {
        user: {
            comparePassword: {
                compute(user) {
                    return async (canditatePassword) => {
                        const isMatch = await bcrypt.compare(canditatePassword, user.password);
                        return isMatch;
                    }
                }
            }
        }
    }
});

export default userModel