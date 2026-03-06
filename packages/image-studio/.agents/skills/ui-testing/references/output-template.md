# Test Output Template

```
## Image Studio UI Smoke Test Results

**Date:** YYYY-MM-DD
**Tester:** [Name]
**Branch:** forno-194/image-studio-feature-parity
**Site:** https://[site].wordpress.com

### Results Summary
- Total Sections: 12
- Passed: [N]
- Partial: [N]
- Failed: [N]
- Untestable: [N]

### Section Results

| Section | Status | Notes |
|---------|--------|-------|
| 1. Media Library Entry Points | ✅/⚠️/❌ | [Details if failed] |
| 2. Edit Mode | ✅/⚠️/❌ | [Details if failed] |
| 3. Sidebar & Metadata | ✅/⚠️/❌ | [Details if failed] |
| 4. Unsaved Changes Dialog | ✅/⚠️/❌ | [Details if failed] |
| 5. Generate Mode | ✅/⚠️/❌ | [Details if failed] |
| 6. Prompt & AI Response | ✅/⚠️/❌ | [Details if failed] |
| 7. Save Flow | ✅/⚠️/❌ | [Details if failed] |
| 8. Hash Deep-Link | ✅/⚠️/❌ | [Details if failed] |
| 9. Block Editor — Generate | ✅/⚠️/❌ | [Details if failed] |
| 10. Block Editor — Edit | ✅/⚠️/❌ | [Details if failed] |
| 11. Navigation Arrows | ✅/⚠️/❌ | [Details if failed] |
| 12. Delete Permanently | ✅/⚠️/❌ | [Details if failed] |

### Console Errors (if any)
```

[Paste relevant errors]

```

### Failed DOM Assertions (if any)
- Step X.X: Expected `.selector` to be visible, got `offsetHeight: 0`
- Step X.X: Expected `button` to be disabled, got `disabled: false`
```

## Reporting Issues

For each failure, capture:

1. **Exact step** that failed
2. **DOM state** — what the selector returned vs. what was expected
3. **Browser DevTools Console** errors (if any, via `playwright_console_logs`)
4. **Entry point used** (row action, hash deep-link, block editor button, etc.)
