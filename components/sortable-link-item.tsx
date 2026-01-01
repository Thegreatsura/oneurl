"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit, Trash2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import type { Link } from "@/lib/hooks/use-links";

interface SortableLinkItemProps {
  link: Link;
  clickCount?: number;
  isLoadingCounts?: boolean;
  isDeleting?: boolean;
  isToggling?: boolean;
  onToggleActive: (id: string, isActive: boolean) => void;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
}

export function SortableLinkItem({
  link,
  clickCount = 0,
  isLoadingCounts = false,
  isDeleting = false,
  isToggling = false,
  onToggleActive,
  onEdit,
  onDelete,
}: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${isDeleting || isToggling ? "opacity-60" : ""} ${isDragging ? "shadow-lg ring-2 ring-primary" : ""}`}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{link.title}</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={() => onEdit(link)}
              title="Edit title"
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground truncate">{link.url}</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={() => onEdit(link)}
              title="Edit URL"
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-4 mt-2">
            {isLoadingCounts ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BarChart3 className="h-3 w-3" />
                <span>
                  {clickCount} {clickCount === 1 ? "click" : "clicks"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={link.isActive}
            onCheckedChange={(checked) => onToggleActive(link.id, checked)}
            disabled={isToggling || isDeleting}
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(link.id)}
            disabled={isToggling || isDeleting}
            title="Delete link"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

