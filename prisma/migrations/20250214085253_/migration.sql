/*
  Warnings:

  - You are about to drop the column `moodeImageUrl` on the `Entry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Entry" DROP COLUMN "moodeImageUrl",
ADD COLUMN     "moodImageUrl" TEXT;
