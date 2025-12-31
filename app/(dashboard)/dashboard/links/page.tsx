"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogClose,
} from "@/components/ui/alert-dialog";
import { LinkDialog } from "@/components/link-dialog";
import {
  useLinks,
  useCreateLink,
  useUpdateLink,
  useDeleteLink,
  type Link,
} from "@/lib/hooks/use-links";

export default function LinksPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState<Link | null>(null);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);

  const { data: links = [], isLoading } = useLinks();
  const createLink = useCreateLink();
  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();

  const handleAdd = async (data: { title: string; url: string }) => {
    await createLink.mutateAsync(data);
    setAddDialogOpen(false);
  };

  const handleEditClick = (link: Link) => {
    setLinkToEdit(link);
    setEditDialogOpen(true);
  };

  const handleUpdate = async (data: { title: string; url: string }) => {
    if (!linkToEdit) return;
    await updateLink.mutateAsync({
      id: linkToEdit.id,
      data,
    });
    setEditDialogOpen(false);
    setLinkToEdit(null);
  };

  const handleEditDialogChange = (open: boolean) => {
    if (!open) {
      setLinkToEdit(null);
    }
    setEditDialogOpen(open);
  };

  const handleDeleteClick = (id: string) => {
    setLinkToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!linkToDelete) return;

    try {
      await deleteLink.mutateAsync(linkToDelete);
      setDeleteDialogOpen(false);
      setLinkToDelete(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateLink.mutateAsync({
        id,
        data: { isActive: !isActive },
      });
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Links</h1>
          <p className="text-muted-foreground mt-2">
            Add, edit, and organize your profile links
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          Create New Link
        </Button>
      </div>

      <div className="space-y-4">
        {links.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No links yet. Click &quot;Create New Link&quot; to add your first link.
              </p>
            </CardContent>
          </Card>
        ) : (
          links.map((link) => {
            const isDeleting = deleteLink.isPending && linkToDelete === link.id;
            const isToggling = updateLink.isPending;

            return (
              <Card
                key={link.id}
                className={isDeleting || isToggling ? "opacity-60" : ""}
              >
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex-1">
                    <p className="font-medium">{link.title}</p>
                    <p className="text-sm text-muted-foreground">{link.url}</p>
                    {(isDeleting || isToggling) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Processing...
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(link.id, link.isActive)}
                      disabled={isToggling || isDeleting}
                    >
                      {link.isActive ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClick(link)}
                      disabled={isToggling || isDeleting}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive-outline"
                      onClick={() => handleDeleteClick(link.id)}
                      disabled={isToggling || isDeleting}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <LinkDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAdd}
        isPending={createLink.isPending}
        title="Add New Link"
        description="Add a new link to your profile. Enter a title and URL."
        submitLabel="Add Link"
      />

      <LinkDialog
        open={editDialogOpen}
        onOpenChange={handleEditDialogChange}
        onSubmit={handleUpdate}
        isPending={updateLink.isPending}
        initialData={linkToEdit}
        title="Edit Link"
        description="Update the title and URL for this link."
        submitLabel="Save Changes"
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this link? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose>
              <Button variant="outline" disabled={deleteLink.isPending}>
                Cancel
              </Button>
            </AlertDialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteLink.isPending}
            >
              {deleteLink.isPending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
