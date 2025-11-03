import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { likesAPI, postsAPI } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
  id: string;
  authorUsername: string;
  content: string;
  createdAt: string;
  liked: boolean;
  likedCount: number;
}

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
  onLikeToggle?: (postId: string, liked: boolean) => void;
}

export function PostCard({ post, onDelete, onLikeToggle }: PostCardProps) {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likedCount);
  const [loading, setLoading] = useState(false);

  const handleLikeToggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (liked) {
        await likesAPI.unlikePost(post.id);
        setLiked(false);
        setLikeCount((prev) => prev - 1);
      } else {
        await likesAPI.likePost(post.id);
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
      onLikeToggle?.(post.id, !liked);
    } catch (error) {
      toast.error('Failed to update like');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await postsAPI.deletePost(post.id);
      toast.success('Post deleted');
      onDelete?.(post.id);
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const isOwner = userInfo?.username === post.authorUsername;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center space-x-4 pb-3">
        <Link to={`/user/${post.authorUsername}`}>
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {post.authorUsername[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <Link to={`/user/${post.authorUsername}`} className="hover:underline">
            <p className="font-semibold">@{post.authorUsername}</p>
          </Link>
          <p className="text-xs text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString()} at{' '}
            {new Date(post.createdAt).toLocaleTimeString()}
          </p>
        </div>
        {isOwner && (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDelete}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLikeToggle}
          disabled={loading}
          className={liked ? 'text-destructive hover:text-destructive/90' : 'hover:text-primary'}
        >
          <Heart className={`mr-2 h-4 w-4 ${liked ? 'fill-current' : ''}`} />
          {likeCount}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/post/${post.id}`)}
          className="hover:text-primary"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          View
        </Button>
      </CardFooter>
    </Card>
  );
}
