"use server";

import { auth } from "@clerk/nextjs/server";
import { PrismaClient} from "@prisma/client";
import { MOODS } from "../app/lib/moods";

const db=new PrismaClient();

export async function createJournalEntry(data: { mood: string }){

    try {
        const {userId}=await auth();
        if(!userId) throw new Error("Unauthorized");

        //Arcjet

        const user =await db.user.findUnique({
            where:{
                clerkUserId:userId
            }
        });
        const mood=MOODS[data.mood.toUpperCase()];

        if(!mood) throw new Error("Invalid mood");

    } catch (error) {
        
    }
}