package com.microblog.services;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.microblog.demo.SseService;
import com.microblog.dto.NotificationView;
import com.microblog.models.Notification;
import com.microblog.models.Notification.NotificationType;
import com.microblog.models.Post;
import com.microblog.models.User;
import com.microblog.repositories.NotificationRepository;
import com.microblog.repositories.UserRepository;

@Service
public class NotificationService {

  @Autowired
  private NotificationRepository notificationRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private CurrentUserService currentUserService;

  @Autowired
  private SseService sseService;

  @Transactional
  public Notification createNotification(NotificationType type, User recipient, User actor, Post post) {
    // Don't create notification if actor is the same as recipient
    if (recipient.getId().equals(actor.getId())) {
      return null;
    }

    Notification notification = new Notification(type, recipient, actor, post);
    Notification saved = notificationRepository.save(notification);

    // Send real-time notification via SSE
    NotificationView view = toNotificationView(saved);
    sseService.sendNotification(recipient.getId(), view);

    return saved;
  }

  public List<NotificationView> getUserNotifications() {
    User user = userRepository.findById(currentUserService.getId()).orElseThrow();
    List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
    return notifications.stream()
        .map(this::toNotificationView)
        .collect(Collectors.toList());
  }

  public List<NotificationView> getUnreadNotifications() {
    User user = userRepository.findById(currentUserService.getId()).orElseThrow();
    List<Notification> notifications = notificationRepository.findByRecipientAndIsReadFalseOrderByCreatedAtDesc(user);
    return notifications.stream()
        .map(this::toNotificationView)
        .collect(Collectors.toList());
  }

  public long getUnreadCount() {
    User user = userRepository.findById(currentUserService.getId()).orElseThrow();
    return notificationRepository.countByRecipientAndIsReadFalse(user);
  }

  @Transactional
  public void markAsRead(UUID notificationId) {
    Notification notification = notificationRepository.findById(notificationId).orElseThrow();
    
    // Verify the notification belongs to the current user
    if (!notification.getRecipient().getId().equals(currentUserService.getId())) {
      throw new RuntimeException("Unauthorized access to notification");
    }
    
    notification.setRead(true);
    notificationRepository.save(notification);
  }

  @Transactional
  public void markAllAsRead() {
    User user = userRepository.findById(currentUserService.getId()).orElseThrow();
    List<Notification> unreadNotifications = notificationRepository
        .findByRecipientAndIsReadFalseOrderByCreatedAtDesc(user);
    
    unreadNotifications.forEach(n -> n.setRead(true));
    notificationRepository.saveAll(unreadNotifications);
  }

  private NotificationView toNotificationView(Notification notification) {
    return new NotificationView(
        notification.getId(),
        notification.getType(),
        notification.getActor().getUsername(),
        notification.getActor().getId(),
        notification.getPost() != null ? notification.getPost().getId() : null,
        notification.getCreatedAt(),
        notification.isRead());
  }
}
