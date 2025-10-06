# Test Plan: Hotjar Integration for A8C-for-Agencies Signup Pages

## Overview
This test plan covers the integration of Hotjar tracking (ID: 6527274) on the Automattic for Agencies signup and landing pages.

## Test Environment
- **Environment**: Automattic for Agencies (a8c-for-agencies)
- **Base URL**: agencies.automattic.com
- **Calypso Live URL**: Use the Calypso Live link provided in the PR comments

## Prerequisites
1. Access to Automattic for Agencies environment
2. Browser with Developer Tools (Chrome, Firefox, Edge, or Safari)
3. Optional: Browser extension to disable ad blockers (they may block Hotjar)
4. Optional: Access to Hotjar dashboard to verify events are being received

## Pages to Test

### 1. Main Signup Page
**URL**: `/signup`

**Component**: 
- With `a4a-signup-v2` enabled (production config): `AgencySignupV2`
- Without flag: `SignupForm`

### 2. WC Asia Signup Page
**URL**: `/signup/wc-asia`

**Component**: `AgencySignupWCAsia`

---

## Test Cases

### Test Case 1: Verify Hotjar Script Loading on Main Signup Page

**Steps**:
1. Open browser and navigate to Calypso Live URL or `agencies.automattic.com/signup`
2. Open Developer Tools (F12)
3. Go to the **Network** tab
4. Ensure "Preserve log" is checked
5. Clear network log
6. Refresh the page or navigate to `/signup`
7. Filter network requests by "hotjar"

**Expected Results**:
- ✅ Request to `static.hotjar.com/c/hotjar-6527274.js?sv=6` should appear
- ✅ Response status should be `200 OK`
- ✅ Script should be loaded asynchronously
- ✅ Content-Type should be `application/javascript` or `text/javascript`

**Screenshot Location**: Network tab showing hotjar script request

---

### Test Case 2: Verify Hotjar Script Loading on WC Asia Signup Page

**Steps**:
1. Navigate to `/signup/wc-asia`
2. Open Developer Tools (F12)
3. Go to the **Network** tab
4. Ensure "Preserve log" is checked
5. Clear network log
6. Refresh the page
7. Filter network requests by "hotjar"

**Expected Results**:
- ✅ Request to `static.hotjar.com/c/hotjar-6527274.js?sv=6` should appear
- ✅ Response status should be `200 OK`
- ✅ Script should be loaded asynchronously

---

### Test Case 3: Verify Hotjar JavaScript Objects in Console

**Steps**:
1. Navigate to `/signup`
2. Open Developer Tools (F12)
3. Go to the **Console** tab
4. Wait for page to fully load
5. Type `window.hj` and press Enter
6. Type `window._hjSettings` and press Enter

**Expected Results**:
- ✅ `window.hj` should be defined as a function
- ✅ `window._hjSettings` should be an object
- ✅ `window._hjSettings.hjid` should equal `6527274`
- ✅ `window._hjSettings.hjsv` should equal `6`

**Screenshot Location**: Console showing window.hj and window._hjSettings

---

### Test Case 4: Verify Debug Messages (Optional - Development Only)

**Steps**:
1. Open Developer Tools Console
2. Enable verbose logging by running: `localStorage.debug = 'calypso:analytics:hotjar'`
3. Refresh the page at `/signup`
4. Check console for debug messages

**Expected Results**:
- ✅ Should see message: `calypso:analytics:hotjar Loading HotJar script`
- ✅ Should NOT see: `calypso:analytics:hotjar Not loading HotJar script` (unless tracking is disabled)

---

### Test Case 5: Verify No Duplicate Script Loading

**Steps**:
1. Navigate to `/signup`
2. Open Developer Tools Network tab
3. Clear network log
4. Navigate to `/signup/wc-asia`
5. Filter by "hotjar"

**Expected Results**:
- ✅ Hotjar script should NOT be requested again (already loaded from previous page)
- ✅ Or if new request appears, verify it's using browser cache (status `304 Not Modified` or from cache)

---

### Test Case 6: Verify HubSpot Script Still Loads (Regression Test)

**Steps**:
1. Navigate to `/signup`
2. Open Developer Tools Network tab
3. Filter by "hs-scripts"

**Expected Results**:
- ✅ Request to `js.hs-scripts.com/45522507.js` should appear
- ✅ Response status should be `200 OK`
- ✅ HubSpot script should load successfully alongside Hotjar

---

### Test Case 7: Verify Hotjar Works with Ad Blockers Disabled

**Note**: Ad blockers may block Hotjar. This test ensures the script attempts to load correctly.

**Steps**:
1. Disable all ad blocker extensions
2. Clear browser cache
3. Navigate to `/signup`
4. Open Developer Tools Network tab
5. Check for hotjar script request

**Expected Results**:
- ✅ Hotjar script request appears
- ✅ Script loads successfully without being blocked

---

### Test Case 8: Verify Correct Environment Detection

**Steps**:
1. Access the page source or use Console
2. Run: `document.querySelector('script[src*="hotjar"]').src`

**Expected Results**:
- ✅ Should return: `//static.hotjar.com/c/hotjar-6527274.js?sv=6`
- ✅ Verify the ID is `6527274` (A8C for Agencies), NOT `227769` (WordPress.com) or `3165344` (Jetpack Cloud)

---

### Test Case 9: Verify Hotjar on Different Browsers

**Browsers to Test**:
- Chrome/Edge (Chromium)
- Firefox
- Safari (if testing on macOS)

**Steps**:
1. Repeat Test Case 1 on each browser
2. Verify script loads correctly

**Expected Results**:
- ✅ Hotjar script loads on all major browsers
- ✅ No console errors related to Hotjar

---

### Test Case 10: Verify Hotjar Tracking Configuration (Optional - Requires Hotjar Dashboard Access)

**Steps**:
1. Log into Hotjar dashboard with account that has access to site ID 6527274
2. Navigate to site tracking settings
3. Trigger a test event by interacting with signup form
4. Check Hotjar dashboard for new session recording

**Expected Results**:
- ✅ New session appears in Hotjar dashboard
- ✅ Session is tagged with correct site ID (6527274)
- ✅ User interactions on signup form are being recorded

---

## Edge Cases to Test

### Edge Case 1: Tracking Preferences Respected
If user has opted out of tracking via privacy settings:
- ✅ Verify `mayWeTrackByTracker('hotjar')` returns false
- ✅ Hotjar script should NOT load

### Edge Case 2: Configuration Disabled
If `hotjar_enabled` is set to `false` in config:
- ✅ Hotjar script should NOT load
- ✅ Console may show: "Not loading HotJar script"

---

## Performance Checks

### Performance Test 1: Page Load Time
**Steps**:
1. Open Developer Tools Performance tab
2. Record page load
3. Navigate to `/signup`
4. Stop recording

**Expected Results**:
- ✅ Hotjar script loads asynchronously (doesn't block page rendering)
- ✅ Page load time not significantly impacted (< 100ms difference)

### Performance Test 2: Script Size
**Steps**:
1. Check Network tab for hotjar script
2. Note the file size

**Expected Results**:
- ✅ Script size is reasonable (typically 20-50KB)
- ✅ Script is compressed (gzip/brotli)

---

## Regression Testing

### Regression Test 1: Signup Flow Still Works
**Steps**:
1. Complete a full signup flow on `/signup`
2. Verify each step progresses correctly

**Expected Results**:
- ✅ Signup form still functions normally
- ✅ No JavaScript errors in console
- ✅ Form submissions work as expected

### Regression Test 2: Existing Analytics Still Work
**Steps**:
1. Navigate to signup page
2. Check for other analytics scripts (Google Analytics, Tracks, etc.)

**Expected Results**:
- ✅ All existing analytics scripts still load
- ✅ No conflicts between Hotjar and other tracking scripts

---

## Accessibility Testing

### Accessibility Test 1: Screen Reader Compatibility
**Steps**:
1. Enable screen reader
2. Navigate through `/signup` page
3. Verify Hotjar script doesn't interfere

**Expected Results**:
- ✅ Screen reader functions normally
- ✅ Hotjar tracking doesn't create accessibility barriers

---

## Troubleshooting Guide

### Issue: Hotjar script not loading

**Possible Causes**:
1. Ad blocker is active - Disable ad blockers and retry
2. `hotjar_enabled` is false in config - Check config file
3. User has opted out of tracking - Check privacy settings
4. Network/firewall blocking hotjar domain - Check network connectivity

**Debug Steps**:
1. Check console for error messages
2. Verify `window.hj` is undefined
3. Check Network tab for failed requests
4. Run: `localStorage.debug = 'calypso:analytics:hotjar'` and check debug logs

### Issue: Wrong Hotjar ID loading

**Possible Causes**:
1. Environment not detected correctly
2. Config issue

**Debug Steps**:
1. Check `window._hjSettings.hjid` value
2. Verify environment using: Check what config `env_id` is set to
3. Ensure `isA8CForAgencies()` returns true

### Issue: Hotjar loading multiple times

**Possible Causes**:
1. Component mounting/unmounting multiple times
2. Navigation between pages

**Debug Steps**:
1. Check Network tab for multiple hotjar script requests
2. Verify `hotJarScriptLoaded` flag is working correctly
3. Check for duplicate `useEffect` calls

---

## Sign-off Checklist

Before marking this feature as complete, verify:

- [ ] Test Case 1: Hotjar loads on main signup page
- [ ] Test Case 2: Hotjar loads on WC Asia signup page
- [ ] Test Case 3: Hotjar JavaScript objects are correctly initialized
- [ ] Test Case 5: No duplicate script loading
- [ ] Test Case 6: HubSpot still works (regression)
- [ ] Test Case 8: Correct environment detection (ID 6527274)
- [ ] Test Case 9: Works on multiple browsers
- [ ] Regression Test 1: Signup flow still works
- [ ] No console errors related to Hotjar
- [ ] No accessibility issues introduced

---

## Additional Notes

- **Privacy**: Ensure compliance with privacy policies and GDPR requirements
- **Data Retention**: Verify Hotjar data retention policies align with company policies
- **User Consent**: Confirm user consent mechanisms are in place if required
- **Monitoring**: Set up alerts for Hotjar script loading failures in production

---

## Test Report Template

```
Tester: [Name]
Date: [Date]
Environment: [Calypso Live URL or Production]
Browser: [Browser and Version]

Test Results:
✅ Test Case 1: PASS
✅ Test Case 2: PASS
...

Issues Found:
1. [Description]
2. [Description]

Screenshots Attached:
- [Link to screenshot 1]
- [Link to screenshot 2]

Overall Status: PASS / FAIL / PARTIAL
Notes: [Any additional observations]
```
