# Cookie Flush

Chromium writes cookies to disk lazily. If the app quits shortly after a cookie is set, such as the `wordpress_logged_in` cookie right after logging in, the cookie can be lost and the user is logged out on the next launch.

This handler defers the first `before-quit` event, calls `session.defaultSession.cookies.flushStore()`, and then calls `app.quit()` again. The flush is capped at 2 seconds so a stalled flush never blocks quitting.
