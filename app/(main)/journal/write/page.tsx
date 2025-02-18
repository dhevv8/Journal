"use client";
import { journalSchema } from "@/app/lib/schema";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import "react-quill-new/dist/quill.snow.css";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BarLoader } from "react-spinners";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMoodById, MOODS } from "@/app/lib/moods";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/user-fetch";
import { createJournalEntry } from "@/actions/journal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCollection, getCollection } from "@/actions/collection";
import CollectionForm from "@/components/collection-dialog";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const JournalEntryPage = () => {

  const [isCreatingCollectionDialogOpen,setIsCreatingCollectionDialogOpen]=useState(false);
  const {
    loading: actionLoading,
    fn: actionFn,
    data: actionResult,
  } = useFetch(createJournalEntry);

  const {
    loading: collectionLoading,
    data: collections,
    fn: fetchCollections,
  }=useFetch(getCollection);

  const {
    loading:createCollectionLoading,
    fn:createCollectionFn,
    data:createCollectionResult,
  }=useFetch(createCollection);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    setValue
  } = useForm({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      title: "",
      content: "",
      mood: "",
      collectionId: "",
    },
  });

  useEffect(()=>{
    fetchCollections();
  },[]);

  
  const router = useRouter();

  useEffect(() => {
    if (actionResult && !actionLoading) {
      router.push(`/collections/${actionResult.collectionId || "unorganized"}`);
      toast.success("Journal entry created successfully");
    }
  }, [actionResult?.collectionId, actionLoading, router]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const mood = getMoodById(data.mood);

      if (!data || !data.title || !data.content || !data.mood) {
        toast.error("Please fill in all fields before submitting.");
        return;
      }

      await actionFn({
        ...data,
        moodScore: mood?.score,
        moodQuery: mood?.pixabayQuery,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to create journal entry. Please try again.");
    }
  });

  const handleCreateCollection=async(data:any)=>{
    createCollectionFn(data);
  }

  useEffect(()=>{
    if(createCollectionResult){
      setIsCreatingCollectionDialogOpen(false);
      fetchCollections();
      setValue("collectionId",createCollectionResult.id);
      toast.success("Collection created successfully");
    }
  },[createCollectionResult])

  const isLoading = actionLoading||collectionLoading;
  return (
    <div className="py-8">
      <form className="space-y-2 mx-auto" onSubmit={onSubmit}>
        <h1 className="text-5xl md:text-6xl gradient-title">
          What's on your mind?
        </h1>
        {isLoading && <BarLoader color="orange" width={"100%"} />}
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            disabled={isLoading}
            {...register("title")}
            placeholder="Give your entry a title..."
            className={`py-5 md:text-md ${errors.title ? "border-red-500" : ""}`}
            aria-invalid={!!errors.title}
            aria-describedby="title-error"
          />
          {errors.title && (
            <p id="title-error" className="text-red-500 text-sm">
              {errors.title.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">How are you feeling?</label>
          <Controller
            name="mood"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={errors.mood ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a mood..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MOODS).map((mood) => (
                    <SelectItem key={mood.id} value={mood.id}>
                      <span className="flex items-center gap-2">
                        {mood.emoji} {mood.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.mood && (
            <p className="text-red-500 text-sm">{errors.mood.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {getMoodById(getValues("mood"))?.prompt ?? "Write your thoughts..."}
          </label>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <ReactQuill
                readOnly={isLoading}
                theme="snow"
                value={field.value}
                onChange={field.onChange}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, 4, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["blockquote", "code-block"],
                    ["link"],
                    ["clean"],
                  ],
                }}
                className="ql-editor"
              />
            )}
          />
          {errors.content && (
            <p className="text-red-500 text-sm">{errors.content.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Add to collection (optional)
          </label>
          <Controller
            name="collectionId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={(value:any)=>{
               if (value==="new"){
                  setIsCreatingCollectionDialogOpen(true);
                }
              else{
                field.onChange(value);
              }
              }}value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a collection..." />
                </SelectTrigger>
                <SelectContent>
                {collections?.map((collection: { id: string; name: string }) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                <SelectItem value="new">
                  Create new collection
                </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.collectionId && (
            <p className="text-red-500 text-sm">{errors.collectionId.message}</p>
          )}
        </div>
        <div className="space-y-4 flex">
          <Button
            type="submit"
            disabled={ actionLoading}
            className="w-full"
            variant="journal"
          >
            Publish
          </Button>
        </div>
      </form>
      <CollectionForm
       loading={createCollectionLoading}
       onSuccess={handleCreateCollection}
       open={isCreatingCollectionDialogOpen}
      setOpen={setIsCreatingCollectionDialogOpen}
      />
    </div>
  );
};

export default JournalEntryPage;