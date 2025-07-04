# How Claude Code Helped Investigate Critical Mobile App Referral Drops

## Executive Summary

Claude Code identified potential causes for two major drops in Jetpack mobile app installations by analyzing an unfamiliar codebase (WordPress Calypso):

- **April 3-5, 2025**: 40-50% drop in web referrals (both platforms) - potentially related to What's New modal removal
- **March 10-14, 2025**: iOS-specific install drop - possibly connected to mobile detection changes in magic login

## The Investigation Results

### Problem 1: April App Banner Disappearance
**Potential Cause**: Commit `c0a10a96671` removed the What's New modal system (1,385 lines), which may have inadvertently affected app banner display.
**Proposed Fix**: Two-line addition to restore the potentially missing AppBanner component.

### Problem 2: March iOS Install Drop  
**Possible Cause**: Commit `8faa70b0f91` modified mobile detection logic, which could be misidentifying iOS devices as desktop browsers.  
**Impact**: Only iOS affected, Android continued normally.

## What Made These Prompts Effective

### Strengths
- **Specific data**: Exact dates, percentages, and platform distinctions
- **Natural language**: Information scattered as one would speak, not formally organized
- **Clear outputs**: Requested markdown reports with GitHub links
- **Trust in AI**: Let Claude work autonomously with minimal correction

### Minor Areas for Improvement
- **Year clarification**: Had to specify 2025, not 2024
- **Date precision**: "After March 10 in about 4 days" → "March 10-14"

## Why This Worked

The user's observation: "I didn't feel like I had to explain or correct what you were working on after my initial prompts except for a few instances."

This efficiency stemmed from:
- Clear problem statements with business context
- Letting Claude Code work through its systematic approach
- Natural, conversational prompts that didn't require formal structure

## Key Takeaways

### For Teams Using AI Investigation
1. **Be specific**: Dates, percentages, and platforms matter
2. **Write naturally**: No need to organize information perfectly
3. **Request outputs**: Ask for formatted reports to share
4. **Trust the process**: Minimal correction usually needed

### The Meta-Point
This document itself was generated through AI assistance with a few iterations for refinement:
- Initial generation with the requested structure
- Updates to use tentative language and avoid blame
- Final accuracy improvements

This demonstrates that even document creation benefits from the same iterative approach as the investigation - quick initial results followed by targeted refinements.

## Conclusion

Claude Code transformed a complex investigation in an unfamiliar codebase into a rapid discovery process. Two potential causes for mobile app installation drops were identified in minutes rather than days, providing clear paths for further investigation. The natural language interaction and minimal need for correction show that AI-assisted development isn't just about speed - it's about making expert-level investigation accessible to any developer.
