"use server";

import { auth } from "@clerk/nextjs/server";
import { MOODS } from "../app/lib/moods";
import { getPixabayImage } from "./public";
import { db } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { request } from "@arcjet/next";
import aj from "@/app/lib/arcjet";

interface JournalEntryData {
  title: string;
  content: string;
  mood: string;
  moodQuery?: string;
  collectionId?: string | null;
}

export async function createJournalEntry(data: JournalEntryData) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const req=await request();
    const decision=await aj.protect(req,{
      userId,
      requested:1,
    })
    if(decision.isDenied()){
      if(decision.reason.isRateLimit()){
        const {remaining,reset}=decision.reason;
        console.error(`Rate limit exceeded. Remaining requests: ${remaining}. Reset in ${reset} seconds.`);
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      throw new Error("Unauthorized");
    }
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) throw new Error("User not found");

    
    const mood = MOODS[data.mood.toUpperCase()];
    if (!mood) throw new Error("Invalid mood");

    
    const moodImageUrl = await getPixabayImage(data.moodQuery || data.mood);
    if (!moodImageUrl) {
      throw new Error("No mood image found for this mood or query.");
    }
    const entry = await db.entry.create({
      data: {
        title: data.title,
        content: data.content,
        mood: mood.id,
        moodScore: mood.score,
        moodImageUrl,
        userId: user.id,
        collectionId: data.collectionId && data.collectionId !== "" ? data.collectionId : null,
      },
    });
    
    await db.draft.deleteMany({
      where: {
        userId: user.id,
      },
    });

    revalidatePath('/dashboard');

    return entry;

  } catch (error) {
    // Improved error handling
    console.error("Error creating journal entry:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to create journal entry");
  }
}
