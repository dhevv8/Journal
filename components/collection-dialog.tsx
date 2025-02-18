"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { collectionSchema } from "@/app/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js";
import { useForm } from "react-hook-form";
import { BarLoader } from "react-spinners";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

interface CollectionFormProps {
  onSuccess: any;
  open: boolean;
  setOpen: (open: boolean) => void;
  loading: boolean;
}

const CollectionForm = ({
  onSuccess,
  open,
  setOpen,
  loading,
}: CollectionFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  const onSubmit = handleSubmit(async (data) => {
    onSuccess(data);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
          {loading && <BarLoader color="orange" width={"100%"} />}
          <form onSubmit={onSubmit} className="space-y-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Collection Name</label>
              <Input
                disabled={loading}
                {...register("name")}
                placeholder="Enter collection name"
                className={`${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && (
                <p id="title-error" className="text-red-500 text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                disabled={loading}
                {...register("description")}
                placeholder="Enter description"
                className={`${errors.name ? "border-red-500" : ""}`}
              />
              {errors.description && (
                <p id="title-error" className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="journal" disabled={loading}>
                Create Collection
              </Button>
            </div>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionForm;
