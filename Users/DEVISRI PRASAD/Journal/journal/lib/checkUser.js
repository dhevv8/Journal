import { PrismaClient } from "@prisma/client";
import { currentUser } from '@clerk/nextjs/server';

// Initialize Prisma Client
const prisma = new PrismaClient();

export const checkUser = async () => {
    const user = await currentUser();

    if (!user) {
        console.error('No authenticated user found');
        return null;
    }

    try {
        const loggedInUser = await prisma.user.findUnique({
            where: {
                clerkUserid: user.id,
            },
        });

        if (loggedInUser) {
            return loggedInUser;
        }

        // If the user does not exist, create a new user record
        const name = `${user.firstName} ${user.lastName}`;
        const newUser = await prisma.user.create({
            data: {
                clerkUserid: user.id,
                name,
                email: user.emailAddresses.length > 0 ? user.emailAddresses[0].emailAddress : null,
                image: user.imageUrl,
            },
        });

        return newUser;
    } catch (error) {
        console.error(`Error in checkUser function for user ID ${user.id}:`, error);
        return null;
    }
}; 