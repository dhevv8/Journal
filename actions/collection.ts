"use server";
import aj from "@/app/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createCollection(data:any){
    try {
        const {userId}=await auth();
        if(!userId) throw new Error("Unauthorized");
        const req=await request();
    const decision=await aj.protect(req,{
      userId,
      requested:1,
    })
    if(decision.isDenied()){
      if(decision.reason.isRateLimit()){
        const {remaining,reset}=decision.reason;
        console.error({
            code: "RATE_LIMIT_EXCEEDED",
            details: {
              remaining,
              resetInSeconds: reset,
            },
          });
  
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

      const collection =await db.Collections.create({
        data:{
            name:data.name,
            description:data.description,
            userId:user.id,
        }
      });
      revalidatePath("/dashboard");
      return collection;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('An unexpected error occurred');
    }
}

export async function getCollection(){

        const {userId}=await auth();
        if(!userId) throw new Error("Unauthorized");
       
    const user = await db.user.findUnique({
        where: {
          clerkUserId: userId,
        },
      });
      if (!user) throw new Error("User not found");

      const collection =await db.Collections.findMany({
        where:{
            userId:user.id,
        },
        orderBy:{createdAt:"desc"} ,
      });
      
      return collection;
}