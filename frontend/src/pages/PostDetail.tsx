import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { likesAPI, postsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function PostDetail() {
  const { postId } = useParams();
  const { userInfo } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [likedUsers, setLikedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPostDetails();
  }, [postId]);

  const loadPostDetails = async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      // Note: Backend doesn't have a single post endpoint yet
      // For now, we'll just load the liked users
      // The post data should come from navigation state or backend endpoint
      const likedUsersData = await likesAPI.getUsersWhoLikedPost(postId);
      setLikedUsers(likedUsersData);
      
      // Mock post data - in production, fetch from backend
      // await postsAPI.getPost(postId)
    } catch (error) {
      toast.error('Failed to load post details');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!postId || !post) return;

    try {
      if (post.isLiked) {
        await likesAPI.unlikePost(postId);
        setPost({ ...post, isLiked: false, likeCount: post.likeCount - 1 });
      } else {
        await likesAPI.likePost(postId);
        setPost({ ...post, isLiked: true, likeCount: post.likeCount + 1 });
      }
      await loadPostDetails();
    } catch (error) {
      toast.error('Failed to update like');
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

  if (!post) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Post not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="border-x border-border min-h-screen">
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h1 className="p-4 text-xl font-bold">Post</h1>
        </div>

        <div className="border-b border-border p-6">
          <Link to={`/user/${post.authorUsername}`} className="flex items-center space-x-3 mb-4">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {post.authorUsername[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">@{post.authorUsername}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          </Link>

          <p className="text-lg mb-4">{post.content}</p>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLikeToggle}
            className="space-x-1"
          >
            <Heart
              className={`h-5 w-5 ${post.isLiked ? 'fill-destructive text-destructive' : ''}`}
            />
            <span>{post.likeCount}</span>
          </Button>
        </div>

        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">
            Liked by {likedUsers.length} {likedUsers.length === 1 ? 'user' : 'users'}
          </h2>
          
          <div className="divide-y divide-border">
            {likedUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No likes yet
              </p>
            ) : (
              likedUsers.map((user) => (
                <Link
                  key={user.id}
                  to={`/user/${user.username}`}
                  className="flex items-center space-x-3 py-3 hover:bg-muted/50 rounded-lg px-2"
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">@{user.username}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
