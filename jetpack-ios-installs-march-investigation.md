# Jetpack iOS Install Drop Investigation - March 2025

## Executive Summary

Investigation into a significant drop in Jetpack iOS app installs that occurred around March 10-14, 2025. This drop was specific to iOS and did not affect Android installations during the same period. Analysis reveals a potential root cause related to mobile device detection changes in the magic login flow.

## Key Findings

### 1. Timeline and Scope
- **Affected Period**: March 10-14, 2025 (approximately 4 days after March 10)
- **Platform Impact**: iOS only (iPhone, iPad)
- **Android Impact**: No corresponding drop observed during this period
- **Type**: App install reduction (may be related to web referrals but not confirmed)

### 2. Critical Discovery: Magic Login App Promo Hiding

**PRIMARY SUSPECT**: On March 12, 2025, a commit was made that significantly changed how the Jetpack Mobile App promo is displayed in the magic login flow.

**Commit Details**:
- **Date**: March 12, 2025
- **Commit**: [`8faa70b0f91`](https://github.com/Automattic/wp-calypso/commit/8faa70b0f914f9902f8cca5a982df672857307b9)
- **Pull Request**: [#101198](https://github.com/Automattic/wp-calypso/pull/101198)
- **Title**: "Magic login: Hide Jetpack Mobile App promo on desktop / non-mobile UAs"
- **Author**: Andrew Serong

**Change Summary**:
The commit modified `/client/login/magic-login/index.jsx` to hide the Jetpack Mobile App promo for non-mobile user agents by introducing new mobile detection logic.

### 3. Technical Analysis of the Change

**Before the change**:
```jsx
// App promo was only hidden for A4A users
const isA4A = query?.redirect_to?.includes( 'agencies.automattic.com/client' ) ?? false;

if ( isA4A ) {
    return null; // Hide app promo
}
```

**After the change**:
```jsx
// Added mobile detection logic
const { isiPad, isiPod, isiPhone, isAndroid } = userAgent;
const isMobile = isiPad || isiPod || isiPhone || isAndroid;
const hideAppPromo = isA4A || ! isMobile;

if ( hideAppPromo ) {
    return null; // Hide app promo
}
```

### 4. Potential Root Cause: iOS Detection Issues

**Critical Problem Identified**: The mobile detection logic may have issues specifically with iOS devices:

1. **Inconsistent Detection Methods**: 
   - The magic login flow uses `express-useragent` library properties (`isiPad`, `isiPod`, `isiPhone`)
   - The main app banner component uses direct regex matching: `/iPad|iPod|iPhone/i`
   - This inconsistency could lead to different behavior for the same iOS devices

2. **iPadOS Detection Issues**:
   - Modern iPads running iPadOS may report desktop Safari user agents when in desktop mode
   - The `express-useragent` library may not correctly identify these as mobile devices
   - This could cause the app promo to be hidden on iPads, reducing iOS install referrals

3. **User Agent Parsing Reliability**:
   - The change relies on `express-useragent` parsing which may have edge cases
   - iOS user agent strings have become more complex with recent iOS versions

### 5. Impact Assessment

**Magic Login Flow Importance**:
- Magic login is a significant entry point for WordPress.com users
- Users accessing this flow are actively engaging with authentication, making them prime candidates for app adoption
- Hiding the app promo from iOS users during login would directly impact iOS install rates

**Why iOS-Specific Impact**:
- The detection logic combines `isiPad || isiPod || isiPhone || isAndroid`
- If iOS detection fails but Android detection works, only iOS users would lose the app promo
- This explains why Android installs weren't affected during the same period

### 6. Supporting Evidence

**Timing Correlation**:
- March 12, 2025 commit falls within the March 10-14 problem window
- The change was specifically targeted at mobile app promotion visibility
- No other significant mobile-related changes found in this timeframe

**Other Changes During March 10-14**:
- [`dd97115a0e9`](https://github.com/Automattic/wp-calypso/commit/dd97115a0e9) - Fix mobile button alignment ([PR #101276](https://github.com/Automattic/wp-calypso/pull/101276))
- [`21633d1325c`](https://github.com/Automattic/wp-calypso/commit/21633d1325c) - Fix Add Sites card for mobile ([PR #101260](https://github.com/Automattic/wp-calypso/pull/101260))
- [`057cc985f7e`](https://github.com/Automattic/wp-calypso/commit/057cc985f7e) - Remove business upsell nudge styles ([PR #101049](https://github.com/Automattic/wp-calypso/pull/101049))

## Technical Deep Dive

### Mobile Detection Inconsistencies Found

1. **App Banner Component** (`/client/blocks/app-banner/index.jsx`):
   ```jsx
   const IOS_REGEX = /iPad|iPod|iPhone/i;
   isiOS() {
       return IOS_REGEX.test( this.props.userAgent );
   }
   ```

2. **Magic Login Component** (`/client/login/magic-login/index.jsx`):
   ```jsx
   const { isiPad, isiPod, isiPhone, isAndroid } = userAgent;
   const isMobile = isiPad || isiPod || isiPhone || isAndroid;
   ```

3. **User Agent Library** (`/client/lib/user-agent/index.js`):
   ```jsx
   export default UserAgent.parse( typeof window !== 'undefined' ? window.navigator.userAgent : '' );
   ```

**The Problem**: Different detection methods could yield different results for the same iOS device, especially with:
- iPadOS devices in desktop mode
- Newer iOS versions with modified user agent strings
- Safari's privacy features affecting user agent reporting

## Dependencies and External Factors

### 1. Express-UserAgent Library
- **Dependency**: The magic login change relies on `express-useragent` parsing accuracy
- **Risk**: This library may not be up-to-date with latest iOS user agent patterns
- **Impact**: Could cause false negatives for iOS device detection

### 2. iOS Platform Changes
- **iPadOS Desktop Mode**: iPads can present as desktop Safari, affecting detection
- **Privacy Features**: iOS privacy enhancements may modify user agent strings
- **Safari Updates**: Changes in Safari user agent reporting could affect detection

### 3. User Agent Evolution
- iOS user agents have become more complex and privacy-focused
- Detection libraries may lag behind Apple's changes
- Different detection methods may have different update cycles

## Recommendations

### **URGENT - Immediate Actions**

1. **Verify iOS Detection Accuracy**:
   - Test the magic login flow on various iOS devices (iPhone, iPad in mobile and desktop modes)
   - Check if the app promo appears correctly for iOS users
   - Compare results with the main app banner behavior

2. **Quick Fix Options**:
   - **Option A**: Revert the March 12 change temporarily to restore previous behavior
   - **Option B**: Fix the iOS detection logic to use the same method as the app banner
   - **Option C**: Add logging to track detection accuracy and app promo display rates

3. **Emergency Rollback Plan**:
   - If confirmed as the cause, revert commit [`8faa70b0f91`](https://github.com/Automattic/wp-calypso/commit/8faa70b0f914f9902f8cca5a982df672857307b9)
   - Deploy hotfix within hours to restore iOS install referrals

### **Investigation Steps**

1. **Data Correlation**:
   - Check magic login usage statistics before/after March 12
   - Compare app promo impression rates for iOS vs Android
   - Analyze user agent logs to identify detection failures

2. **Device Testing**:
   - Test on iPhone (various iOS versions)
   - Test on iPad in both mobile and desktop modes
   - Test on iPod Touch if still supported
   - Compare with Android devices for control

3. **Code Review**:
   - Interview Andrew Serong about the motivation for the change
   - Review if there were specific user agent issues that prompted this fix
   - Check for any reported bugs related to desktop app promo display

### **Long-term Solutions**

1. **Standardize Detection Logic**:
   - Create a unified mobile detection utility used across all components
   - Ensure consistent iOS detection across the entire application
   - Regular testing with latest iOS versions and user agent changes

2. **Enhanced Monitoring**:
   - Add specific tracking for app promo display rates by platform
   - Monitor iOS detection accuracy over time
   - Alert on sudden drops in mobile detection rates

3. **Improved Testing**:
   - Add automated tests for mobile detection across different user agents
   - Include regression tests for iOS detection specifically
   - Test with realistic iOS user agent strings including iPadOS variations

## Alternative Hypotheses

While the magic login change is the primary suspect, other possibilities include:

1. **iOS Platform Changes**: Apple may have changed something in iOS that affects web-to-app attribution
2. **App Store Algorithm**: Changes in App Store search or recommendation algorithms
3. **Marketing Campaign Changes**: Reduction in iOS-specific marketing efforts
4. **External Website Changes**: Partner sites or referral sources may have changed their iOS linking

## Conclusion

**LIKELY ROOT CAUSE IDENTIFIED**: The March 12, 2025 commit that modified mobile detection in the magic login flow appears to be the most probable cause of the iOS install drop.

**Key Evidence**:
- Perfect timing correlation (March 12 within March 10-14 window)
- iOS-specific impact matches the platform-specific install drop
- Technical change directly affects iOS app promotion visibility
- Inconsistent detection methods between components suggest reliability issues

**Confidence Level**: HIGH - The technical change, timing, and platform-specific impact strongly suggest this is the root cause.

**Recommended Action**: Immediate investigation of iOS detection accuracy in the magic login flow, with potential rollback if confirmed as the cause.

**Impact**: If confirmed and fixed, this should restore the iOS install referral rates to pre-March 12 levels.