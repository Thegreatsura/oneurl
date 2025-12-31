"use client";

import { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import type { OurFileRouter } from "@/lib/uploadthing";
import { useUpdateProfile, useUpdateAvatar } from "@/lib/hooks/use-profile";

export default function SettingsClient({
  initialProfile,
}: {
  initialProfile: { name: string; bio: string; username: string; avatarUrl: string | null };
}) {
  const [name, setName] = useState(initialProfile.name);
  const [bio, setBio] = useState(initialProfile.bio);
  const [username, setUsername] = useState(initialProfile.username);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile.avatarUrl);
  const [isUploading, setIsUploading] = useState(false);

  const updateProfile = useUpdateProfile();
  const updateAvatar = useUpdateAvatar();

  const handleUploadComplete = async (res: { url: string }[]) => {
    if (res && res[0]?.url) {
      const newAvatarUrl = res[0].url;
      setAvatarUrl(newAvatarUrl);
      setIsUploading(false);
      await updateAvatar.mutateAsync(newAvatarUrl);
    }
  };

  const handleSave = async () => {
    await updateProfile.mutateAsync({ name, bio, username });
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile and account settings
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32 border-2">
                {avatarUrl && <AvatarImage src={avatarUrl} alt="Profile picture" />}
                <AvatarFallback>
                  <svg
                    className="h-12 w-12 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </AvatarFallback>
              </Avatar>
              <UploadButton<OurFileRouter, "avatarUploader">
                endpoint="avatarUploader"
                onUploadBegin={() => setIsUploading(true)}
                onClientUploadComplete={handleUploadComplete}
                onUploadError={() => {
                  setIsUploading(false);
                }}
                content={{
                  button: ({ ready }: { ready: boolean }) => (
                    <Button type="button" disabled={!ready || isUploading || updateAvatar.isPending}>
                      {isUploading || updateAvatar.isPending ? "Uploading..." : "Change Avatar"}
                    </Button>
                  ),
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={updateProfile.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                disabled={updateProfile.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                disabled={updateProfile.isPending}
              />
            </div>
            <Button onClick={handleSave} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive-outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
