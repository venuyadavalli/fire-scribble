package com.microblog.demo;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.microblog.dto.NotificationView;

@Service
public class SseService {
  private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
  private final Map<String, List<SseEmitter>> userEmitters = new ConcurrentHashMap<>();
  private final ObjectMapper objectMapper = new ObjectMapper();

  public SseEmitter createEmitter() {
    SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
    emitters.add(emitter);

    emitter.onCompletion(() -> emitters.remove(emitter));
    emitter.onTimeout(() -> emitters.remove(emitter));
    emitter.onError((e) -> {
      System.out.println("[SseService]:onError " + e.getMessage());
      emitters.remove(emitter);
    });

    return emitter;
  }

  public SseEmitter createUserEmitter(String userId) {
    SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
    
    userEmitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

    emitter.onCompletion(() -> removeUserEmitter(userId, emitter));
    emitter.onTimeout(() -> removeUserEmitter(userId, emitter));
    emitter.onError((e) -> {
      System.out.println("[SseService]:onError for user " + userId + ": " + e.getMessage());
      removeUserEmitter(userId, emitter);
    });

    return emitter;
  }

  private void removeUserEmitter(String userId, SseEmitter emitter) {
    List<SseEmitter> emitters = userEmitters.get(userId);
    if (emitters != null) {
      emitters.remove(emitter);
      if (emitters.isEmpty()) {
        userEmitters.remove(userId);
      }
    }
  }

  public void sendPing(String message) {
    System.out.println("SSE SERVICE: sendPing: invoked");
    for (SseEmitter emitter : emitters) {
      try {
        emitter.send(
            SseEmitter.event()
                .name("ping")
                .data(message));
      } catch (IOException e) {
        System.out.println("Error sending SSE event: " + e.getMessage());
        emitters.remove(emitter);
      }
    }
  }

  public void sendNotification(String userId, NotificationView notification) {
    List<SseEmitter> emitters = userEmitters.get(userId);
    if (emitters == null || emitters.isEmpty()) {
      System.out.println("No active emitters for user: " + userId);
      return;
    }

    System.out.println("Sending notification to user " + userId + ": " + notification.getType());
    
    for (SseEmitter emitter : emitters) {
      try {
        String jsonData = objectMapper.writeValueAsString(notification);
        emitter.send(
            SseEmitter.event()
                .name("notification")
                .data(jsonData));
      } catch (IOException e) {
        System.out.println("Error sending notification to user " + userId + ": " + e.getMessage());
        removeUserEmitter(userId, emitter);
      }
    }
  }
}
