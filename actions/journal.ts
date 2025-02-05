"use server";

import { auth } from "@clerk/nextjs/server";
import { Prisma} from "@prisma/client";
import { MOODS } from "../app/lib/moods";
import { getPixabayImage } from "./public";
import {db} from "../lib/prisma";
import { revalidatePath } from "next/cache";

interface JournalEntryData{
    title:string;
    content:string;
    mood:string;
    moodQuery?:string;
    collectionId?:string|null;
}


export async function createJournalEntry(data: JournalEntryData) {

    try {
        const {userId}=await auth();
        if(!userId) throw new Error("Unauthorized");

        //Arcjet

        const user =await db.user.findUnique({
            where:{
                clerkUserId:userId
            }
        });
        if (!user) throw new Error("User not found");
        
        const mood=MOODS[data.mood.toUpperCase()];

        if(!mood) throw new Error("Invalid mood");
        const moodImageUrl=await getPixabayImage(data.moodQuery||data.mood);
        const entry=await db.entry.create({
            data:{
                title:data.title,
                content:data.content,
                mood:mood.id,
                moodScore:mood.score,
                moodImageUrl,
                userId:user.id,
                collectionId:data.collectionId||undefined,
            },
        });
        await db.draft.deleteMany({
            where:{
                userId:user.id
            }
        });
        revalidatePath('/dashboard');
        return entry;

    } catch (error) {
        console.error("Error creating journal entry:",error);
        throw new Error(error instanceof Error?error.message:"Failed to create journal entry");
    }
}