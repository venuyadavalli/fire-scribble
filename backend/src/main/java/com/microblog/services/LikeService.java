package com.microblog.services;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.microblog.models.Like;
import com.microblog.models.Post;
import com.microblog.models.User;
import com.microblog.repositories.LikeRepository;
import com.microblog.repositories.PostRepository;
import com.microblog.repositories.UserRepository;

@Service
public class LikeService {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private PostRepository postRepository;

  @Autowired
  private LikeRepository likeRepository;

  @Autowired
  private CurrentUserService currentUser;

  @Autowired
  private NotificationService notificationService;

  public Like likePost(UUID postId) {
    User user = userRepository.findById(currentUser.getId()).orElseThrow();
    Post post = postRepository.findById(postId).orElseThrow();
    if (!likeRepository.findByUserAndPost(user, post).isEmpty()) {
      throw new RuntimeException("Already liked");
    }
    Like like = new Like(user, post);
    Like saved = likeRepository.save(like);

    // Create notification for the post author
    notificationService.createNotification(
        com.microblog.models.Notification.NotificationType.LIKE,
        post.getAuthor(),
        user,
        post);

    return saved;
  }

  public void unlikePost(UUID postId) {
    User user = userRepository.findById(currentUser.getId()).orElseThrow();
    Post post = postRepository.findById(postId).orElseThrow();
    likeRepository.deleteByUserAndPost(user, post);

    // Create notification for the post author
    notificationService.createNotification(
        com.microblog.models.Notification.NotificationType.UNLIKE,
        post.getAuthor(),
        user,
        post);
  }

  public List<Post> getLikedPostsByUsername(String username) {
    User user = userRepository.findByUsername(username).orElseThrow();
    return user.getLikes().stream().map(Like::getPost).collect(Collectors.toList());
  }

  public List<User> getUsersWhoLikedPost(UUID postId) {
    Post post = postRepository.findById(postId).orElseThrow();
    return likeRepository.findByPost(post).stream().map(Like::getUser).toList();
  }
}
