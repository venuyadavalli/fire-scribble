import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usersAPI, postsAPI, followsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Profile() {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const effectiveUsername = username || user?.displayName || user?.email?.split('@')[0] || '';
  const isOwnProfile = !username || effectiveUsername === user?.displayName || effectiveUsername === user?.email?.split('@')[0];

  useEffect(() => {
    loadProfile();
  }, [effectiveUsername]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileData, postsData] = await Promise.all([
        usersAPI.getProfile(effectiveUsername),
        postsAPI.getUserPosts(effectiveUsername),
      ]);

      setProfile(profileData);
      setPosts(postsData);

      if (profileData.id) {
        const [followersData, followingData] = await Promise.all([
          followsAPI.getFollowers(profileData.id),
          followsAPI.getFollowing(profileData.id),
        ]);
        setFollowers(followersData);
        setFollowing(followingData);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profile) return;

    try {
      if (profile.isFollowed) {
        await followsAPI.unfollowUser(profile.id);
        setProfile({ ...profile, isFollowed: false });
        toast.success('Unfollowed');
      } else {
        await followsAPI.followUser(profile.id);
        setProfile({ ...profile, isFollowed: true });
        toast.success('Following');
      }
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="border-x border-border min-h-screen">
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h1 className="p-4 text-xl font-bold">Profile</h1>
        </div>

        <div className="border-b border-border p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                  {profile.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">@{profile.username}</h2>
                <p className="text-sm text-muted-foreground">
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {!isOwnProfile && (
              <Button onClick={handleFollowToggle} variant={profile.isFollowed ? 'outline' : 'default'}>
                {profile.isFollowed ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </div>

          <div className="mt-4 flex space-x-6">
            <div>
              <span className="font-bold">{posts.length}</span>{' '}
              <span className="text-muted-foreground">Posts</span>
            </div>
            <div>
              <span className="font-bold">{followers.length}</span>{' '}
              <span className="text-muted-foreground">Followers</span>
            </div>
            <div>
              <span className="font-bold">{following.length}</span>{' '}
              <span className="text-muted-foreground">Following</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-border">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            <div className="divide-y divide-border">
              {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-muted-foreground">No posts yet</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="p-4">
                    <PostCard post={post} onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))} />
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="followers" className="mt-0">
            <div className="divide-y divide-border">
              {followers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-muted-foreground">No followers yet</p>
                </div>
              ) : (
                followers.map((follower) => (
                  <Link key={follower.id} to={`/user/${follower.username}`} className="block p-4 hover:bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {follower.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">@{follower.username}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="following" className="mt-0">
            <div className="divide-y divide-border">
              {following.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-muted-foreground">Not following anyone yet</p>
                </div>
              ) : (
                following.map((followee) => (
                  <Link key={followee.id} to={`/user/${followee.username}`} className="block p-4 hover:bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {followee.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">@{followee.username}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
