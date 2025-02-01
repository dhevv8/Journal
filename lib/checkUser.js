import { PrismaClient} from "@prisma/client";
import { currentUser } from '@clerk/nextjs/server';

const db=new PrismaClient();

export const checkUser = async () => {
    const user = await currentUser();

if (!user) {
    console.error('No authenticated user found');
    return null;  // Return null if user is not authenticated
}


    try {
       
        const loggedInUser = await db.user.findUnique({
            where: {
                clerkUserId: user.id, // Ensure the field name matches your Prisma schema
            },
        });

        if (loggedInUser) {
            return loggedInUser; // Return the logged-in user if found
        }

        // If the user does not exist, create a new user record
        const name = `${user.firstName} ${user.lastName}`;
        const newUser = await db.user.create({
            data: {
                clerkUserId: user.id, // Use the correct field name
                name,
                email: user.emailAddresses.length > 0 ? user.emailAddresses[0].emailAddress : null,
                imageUrl: user.imageUrl,
            },
        });

        return newUser; // Return the newly created user
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error in checkUser function for user ID ${user.id}:`, error.message);
          } else {
            console.error(`Error in checkUser function for user ID ${user.id}:`, error);
          }
          return null; // Return null if an error occurs
        }
}
