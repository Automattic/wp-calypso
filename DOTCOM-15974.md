Where users stop receiving Help Center chat messages

The issue has multiple contributing locations in the codebase, all related to the Smooch/Zendesk WebSocket
connection lifecycle:

---

1. packages/odie-client/src/hooks/use-zendesk-message-listener.ts:49-59 — Primary cause

useEffect( () => {
if ( ! isChatLoaded ) {
return; // listener is completely removed when isChatLoaded is false
}
Smooch.on( 'message:received', messageListener );
return () => {
Smooch?.off?.( 'message:received', messageListener );
};
}, [ isChatLoaded, messageListener ] );

Every time isChatLoaded transitions true → false → true (which happens during every Smooch re-initialization),
the message:received listener is torn down and re-added. Any messages arriving during that window are silently
and permanently lost.

---

2. packages/help-center/src/components/help-center-smooch.tsx:179-251 — Triggers the above

The Smooch initialization useEffect calls setIsChatLoaded(false) at line 188 before destroying and re-creating
Smooch. This is what drives the isChatLoaded transition above. This re-initialization fires whenever any of its
deps change: authJwt, authExternalId, authIsLoggedIn, isMessagingScriptLoaded.

---

3. packages/zendesk-client/src/use-authenticate-zendesk-messaging.ts:34-45 (inside initSmooch delegate) — JWT key
   mismatch

The onInvalidAuth handler (called by Smooch when the JWT expires) invalidates and refetches with queryKey:
['getMessagingAuth', 'zendesk', isTestMode]. But HelpCenterSmooch subscribes to ['getMessagingAuth', 'messenger',
isTestMode, true] — a different key. So when the JWT expires and onInvalidAuth fires:

- Smooch internally gets a new JWT (returned from the callback) ✓
- The React component's authJwt from the 'messenger' key is never updated
- If Smooch re-initializes later (e.g., component remount), it uses the stale/expired JWT → init fails → the
  30-second retry loop kicks in → users can't receive messages for 30s+ intervals

---

4. packages/odie-client/src/hooks/use-zendesk-message-listener.ts:28 — Silent message drop

if ( data.conversation.id === chat.conversationId ) {

If chat.conversationId is null (e.g., briefly during a state reset), this guard silently drops all incoming
Zendesk messages. The emptyChat initial state has conversationId: null, and during reconnect/re-fetch in
use-get-combined-chat.ts, there's a window where this can be null while messages arrive.

---

Already fixed (merged)

- PR #109553 (af2f1185d): Wrapped unhandled Smooch.destroy() errors in try-catch (the F39 issue). Previously, a
  destroy() error would abort initialization entirely, leaving chat permanently broken.
- PR #109144 (4ed2860ff): Fixed a setTimeout vs setInterval bug in use-connection-status-notice.tsx and added a
  null guard in use-create-zendesk-conversation.ts.

---

Still open

The core issue is the message reception gap during isChatLoaded = false (points 1+2 above). One fix would be to
not remove the message:received listener during re-initialization — instead, buffer or queue incoming messages
while isChatLoaded is false, or keep the listener active and avoid destroying Smooch unless strictly necessary.

Testing Steps

On trunk (reproducing the bug)

1. Start the dev server and open the Help Center
   Navigate to WordPress.com, open the Help Center, start a live chat so Smooch fully initializes.

2. Set up the Network tab
   Open DevTools → Network → filter by smooch or app.smooch.io. You should see the initial Smooch init request from
   page load.

3.Invalidate query
\_\_hcQueryClient.invalidateQueries({ queryKey: ['getMessagingAuth'] })

Expected on trunk: A new Smooch init request appears in the Network tab — Smooch destroyed and reinitialized. Any
message sent during that window would be lost.

ja ho he provat i efectivament el missatge es perd, però a la meva branca encara no he aconseguit provar

---

On your fix branch

Repeat steps 1–5 exactly.
