"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogPanel,
} from "@/components/ui/dialog";
import { linkSchema } from "@/lib/validations/schemas";
import { toastError } from "@/lib/toast";
import type { Link } from "@/lib/hooks/use-links";

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title: string; url: string }) => Promise<void>;
  isPending?: boolean;
  initialData?: Link | null;
  title: string;
  description: string;
  submitLabel?: string;
}

export function LinkDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
  initialData,
  title,
  description,
  submitLabel = "Add Link",
}: LinkDialogProps) {
  const [formTitle, setFormTitle] = useState(initialData?.title ?? "");
  const [formUrl, setFormUrl] = useState(initialData?.url ?? "");
  const [formError, setFormError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      if (initialData) {
        setFormTitle(initialData.title);
        setFormUrl(initialData.url);
      } else {
        setFormTitle("");
        setFormUrl("");
      }
      setFormError("");
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    try {
      linkSchema.parse({ title: formTitle, url: formUrl });
      await onSubmit({ title: formTitle, url: formUrl });
      if (!initialData) {
        setFormTitle("");
        setFormUrl("");
        formRef.current?.reset();
      }
    } catch (error) {
      if (error && typeof error === "object" && "issues" in error) {
        const zodError = error as { issues: Array<{ message: string }> };
        const errorMessage = zodError.issues[0]?.message || "Invalid input";
        setFormError(errorMessage);
        toastError("Invalid input", errorMessage);
      }
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    if (!initialData) {
      setFormTitle("");
      setFormUrl("");
      formRef.current?.reset();
    }
    setFormError("");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} id="link-form">
          <DialogPanel>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="link-title">Title</Label>
                <Input
                  id="link-title"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    setFormError("");
                  }}
                  placeholder="e.g., My Portfolio"
                  aria-invalid={formError ? "true" : undefined}
                  disabled={isPending}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  type="url"
                  value={formUrl}
                  onChange={(e) => {
                    setFormUrl(e.target.value);
                    setFormError("");
                  }}
                  placeholder="https://example.com"
                  aria-invalid={formError ? "true" : undefined}
                  disabled={isPending}
                />
              </div>
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
            </div>
          </DialogPanel>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? initialData
                  ? "Saving..."
                  : "Adding..."
                : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

