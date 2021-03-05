# Exceptions

Wraps exceptions in the app to provide a better experience.

Uses the [crash tracker](../../lib/crash-tracker/README.md) to send crashes to a remote URL.

When running in release mode the exception stack trace is hidden and replaced with a custom dialog that quits the app.
