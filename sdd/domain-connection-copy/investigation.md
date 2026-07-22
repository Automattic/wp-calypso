# Investigation: Domain connection step progression

## Type

Bug validation

## Status

Already existing

## Summary

The live Dashboard already advances to the next setup section when a checkbox is selected. The original PR commit removed that handler while changing the accordion, and the follow-up reimplemented the same behavior and added a regression test.

## Evidence

- PR base `5b4e4a13fcc` contains the progression handler in `connection-mode-card.tsx`.
- Commit `1e7d58323a8` removed the handler.
- Commit `fa0d0884e2f` restored equivalent behavior in a shorter form and added the progression test.

## Recommendation

Restore the handler from the PR base and remove the new test so the PR preserves existing live behavior without presenting it as new functionality.
