<!--
Link a related Github/Linear issue to this PR. If the PR does not immediately resolve the issue,
for example, it requires a separate deployment to production, avoid
using the "fixes" keyword. Consider using "part of" instead.
-->

Part of DOMAINS-1940

## Proposed Changes

This PR removes unused legacy code from the domain connection setup flow after the redesign was enabled in production. The changes include:

* **Removed feature flag checks**: Removed `isDomainConnectionRedesign` feature flag since the redesign is now enabled in production
* **Removed legacy OptionContent component**: Deleted `option-content.jsx` and its associated styles, as it was replaced by `OptionContentV2`
* **Removed legacy connection flow**: Deleted `legacy-connection-flow.tsx` which was replaced by the new `DomainConnectionSetup` component
* **Removed unused step components**: Deleted 6 unused step components (`advanced-records`, `advanced-start`, `dc-start`, `done`, `suggested-records`, `suggested-start`) that were part of the old flow
* **Removed unused helper components**: Deleted `help-message.tsx`, `switch-setup.tsx`, and `records-list.tsx` that were only used by the legacy flow
* **Cleaned up utilities**: Removed unused `getStepName` function and updated `getProgressStepList` to only support transfer steps
* **Code cleanup**: Removed unused imports, exports, and cleaned up type definitions
* **File organization**: Renamed `style.scss` to `progress.scss` for better clarity

**Summary**: 26 files changed, 44 insertions(+), 1760 deletions(-)

## Why are these changes being made?

The domain connection redesign has been enabled in production, making the legacy components and feature flags obsolete. This cleanup:

* **Reduces codebase size**: Removes ~1,760 lines of unused code
* **Improves maintainability**: Eliminates confusion about which components are in use
* **Reduces technical debt**: Removes dead code that could mislead future developers
* **Simplifies the codebase**: Makes it clearer which components are actively maintained

The legacy flow components were replaced by the new `DomainConnectionSetup` component which provides a better user experience with a card-based interface instead of the step-by-step wizard.

## Testing Instructions

### Manual Testing

1. **Domain Connection Flow**:
   - Navigate to `/domains/add` and select "Use a domain I own"
   - Enter a domain name and proceed through the connection flow
   - Verify that the new redesign UI is displayed (card-based interface)
   - Test both "Suggested" (name servers) and "Advanced" (DNS records) connection modes
   - Verify Domain Connect flow works if supported by the registrar

2. **Domain Transfer Flow**:
   - Navigate to domain transfer setup
   - Verify the transfer flow still works correctly (uses `legacy-transfer-setup.tsx` which is still in use)

3. **Visual Regression**:
   - Verify no visual regressions in the domain connection setup UI
   - Check that progress indicators and DNS record displays work correctly

### Automated Testing

- Existing E2E tests should continue to pass
- No new tests needed as this is a cleanup PR removing unused code

### Areas to Verify

- ✅ Domain connection setup page loads correctly
- ✅ Both suggested and advanced connection modes work
- ✅ Domain Connect flow works (if registrar supports it)
- ✅ Domain transfer flow still works
- ✅ No console errors or TypeScript errors
- ✅ No broken imports or missing components

## Pre-merge Checklist

- [x] Has the general commit checklist been followed? (PCYsg-hS-p2)
- [ ] [Have you written new tests](https://wpcalypso.wordpress.com/devdocs/docs/testing/index.md) for your changes?
  - N/A - This is a cleanup PR removing unused code
- [ ] Have you tested the feature in Simple (P9HQHe-k8-p2), Atomic (P9HQHe-jW-p2), and self-hosted Jetpack sites (PCYsg-g6b-p2)?
- [x] Have you checked for TypeScript, React or other console errors?
- [ ] Have you tested accessibility for your changes? Ensure the feature remains usable with various user agents (e.g., browsers), interfaces (e.g., keyboard navigation), and assistive technologies (e.g., screen readers) (PCYsg-S3g-p2).
- [ ] Have you used memoizing on expensive computations? More info in [Memoizing with create-selector](https://github.com/Automattic/wp-calypso/blob/trunk/packages/state-utils/src/create-selector/README.md) and [Using memoizing selectors](https://react-redux.js.org/api/hooks#using-memoizing-selectors) and [Our Approach to Data](https://github.com/Automattic/wp-calypso/blob/trunk/docs/our-approach-to-data.md)
  - N/A - No new computations added
- [ ] Have we added the "[Status] String Freeze" label as soon as any new strings were ready for translation (p4TIVU-5Jq-p2)?
  - N/A - No new strings added, only removed
- [ ] For changes affecting Jetpack: Have we added the "[Status] Needs Privacy Updates" label if this pull request changes what data or activity we track or use (p4TIVU-aUh-p2)?
  - N/A - No privacy-related changes
