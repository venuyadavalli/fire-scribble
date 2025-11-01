import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { feedAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Post {
  id: string;
  authorUsername: string;
  content: string;
  createdAt: string;
  liked: boolean;
  likedCount: number;
}

export default function Feed() {
  const [activeTab, setActiveTab] = useState<'public' | 'following'>('public');
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = async (pageNum: number, isInitial = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const response =
        activeTab === 'public'
          ? await feedAPI.getPublicFeed(pageNum, 10)
          : await feedAPI.getFollowingFeed(pageNum, 10);

      if (isInitial) {
        setPosts(response.content);
      } else {
        setPosts((prev) => [...prev, ...response.content]);
      }

      setHasMore(pageNum < response.totalPages - 1);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPosts([]);
    setPage(0);
    setHasMore(true);
    loadPosts(0, true);
  }, [activeTab]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage);
  };

  const handlePostDelete = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <Layout>
      <div className="border-x border-border min-h-screen">
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h1 className="p-4 text-xl font-bold">Home</h1>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none">
              <TabsTrigger value="public">Public</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="divide-y divide-border">
          {posts.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg text-muted-foreground">No posts yet</p>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'following'
                  ? 'Follow some users to see their posts here'
                  : 'Be the first to share something!'}
              </p>
            </div>
          )}

          {posts.map((post) => (
            <div key={post.id} className="p-4">
              <PostCard post={post} onDelete={handlePostDelete} />
            </div>
          ))}

          {loading && (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          )}

          {!loading && hasMore && posts.length > 0 && (
            <div className="flex justify-center py-8">
              <Button onClick={handleLoadMore} variant="outline">
                Load more
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
