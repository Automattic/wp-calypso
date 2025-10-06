# Testing Instructions: Pressable + Woo Offer Extension

## Overview
This PR extends the Pressable + Woo migration offer end date from **September 30, 2025** to **October 31, 2025**.

## Before/After Comparison

### BEFORE (September 30, 2025 end date)
**Status:** ❌ Banners NOT displaying (offer expired on Sept 30, 2025)

The banners were hidden because the incentive check failed:
```javascript
const isIncentiveActive = PRESSABLE_PREMIUM_PLAN_MIGRATION_INCENTIVE_END_DATE > new Date();
// Result: false (Sept 30, 2025 < Oct 6, 2025)
```

**Visual State:**
- No banner visible in Overview Sidebar
- No banner visible in Hosting Overview
- No banner visible in Migrations Overview

### AFTER (October 31, 2025 end date)
**Status:** ✅ Banners ARE displaying (offer active until Oct 31, 2025)

The banners are now visible because the incentive check passes:
```javascript
const isIncentiveActive = PRESSABLE_PREMIUM_PLAN_MIGRATION_INCENTIVE_END_DATE > new Date();
// Result: true (Oct 31, 2025 > Oct 6, 2025)
```

**Visual State:**
- ✅ Banner visible in Overview Sidebar showing "Offer ends October 31, 2025"
- ✅ Banner visible in Hosting Overview showing "Offer ends October 31, 2025"
- ✅ Banner visible in Migrations Overview showing "Offer ends October 31, 2025"

**Key Changes:**
1. **Banner Display:** Hidden → Visible
2. **End Date Text:** "September 30, 2025" → "October 31, 2025"
3. **Days Remaining:** 0 days (expired) → 25 days remaining

## Testing Instructions

### Prerequisites
- Access to an A8C for Agencies account
- Agency must have either:
  - More than 50 sites, OR
  - No `number_sites` value set (for backwards compatibility)

### Test Steps

#### 1. Test Overview Sidebar Banner (Card Version)
1. Navigate to the A8C for Agencies Overview page
2. Look at the right sidebar
3. **Expected Result:** 
   - You should see the `PressablePremiumPlanMigrationCard` displayed
   - Card should show: "Switch your client's Woo store to Pressable and earn up to $2,500"
   - Card should display: "Offer ends October 31, 2025"
   - Card should have two buttons: "Refer client now" and "Chat to us about this offer"

#### 2. Test Hosting Overview Banner (Collapsable Version)
1. Navigate to Marketplace → Hosting
2. Look at the hero section near the top
3. **Expected Result:**
   - You should see the `PressablePremiumPlanMigrationBanner` displayed
   - Banner should show: "Get up to $2,500 when you migrate your client's Woo store to Pressable Premium"
   - Banner should display: "Offer ends October 31, 2025"
   - Banner should be collapsable (has expand/collapse functionality)

#### 3. Test Migrations Overview Banner (Non-collapsable Version)
1. Navigate to Migrations section
2. Look at the banner area
3. **Expected Result:**
   - You should see the `PressablePremiumPlanMigrationBanner` displayed
   - Banner should show: "Get up to $2,500 when you migrate your client's Woo store to Pressable Premium"
   - Banner should display: "Offer ends October 31, 2025"
   - Banner should be non-collapsable (always expanded)

#### 4. Verify Date Logic
To verify the date logic is working correctly, you can check the browser console:
```javascript
// The incentive should be active
const endDate = new Date('2025-10-31T23:59:59Z');
const currentDate = new Date();
const isActive = endDate > currentDate;
console.log('Is incentive active:', isActive); // Should be true

// The display date should be formatted correctly
const displayDate = endDate.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC'
});
console.log('Display date:', displayDate); // Should be "October 31, 2025"
```

#### 5. Negative Test: Verify Banner Hides After Oct 31
To test that the banner will properly hide after the offer expires:
1. Temporarily modify the end date in your local environment to a past date
2. Refresh the page
3. **Expected Result:** All banners should be hidden
4. Revert the change to restore normal functionality

### Edge Cases to Test

#### Case 1: Agency with < 50 sites
- **Expected:** Banner should NOT display
- **Reason:** The `isMoreThanMinSites()` check will return false

#### Case 2: Agency with exactly 50 sites
- **Expected:** Banner should NOT display
- **Reason:** The check is `> MIN_SITES_FOR_INCENTIVE` (greater than 50)

#### Case 3: Agency with 51+ sites
- **Expected:** Banner SHOULD display
- **Reason:** Meets the minimum threshold

#### Case 4: Agency with "500+" sites
- **Expected:** Banner SHOULD display
- **Reason:** 500 > 50

#### Case 5: Banner dismissal (Card only)
1. Click the X button on the card in the Overview Sidebar
2. Refresh the page
3. **Expected:** Card should remain dismissed (uses preference storage)

### Verification Checklist
- [ ] Banner displays in Overview Sidebar
- [ ] Banner displays in Hosting Overview
- [ ] Banner displays in Migrations Overview
- [ ] All banners show "October 31, 2025" as the end date
- [ ] All CTAs ("Refer client now" and "Chat to us") are functional
- [ ] Terms link opens correctly
- [ ] Card can be dismissed and stays dismissed
- [ ] Banners properly hide for agencies with < 50 sites

## Technical Details

### Files Modified
- `client/a8c-for-agencies/components/pressable-premium-plan-migration/lib/constants.ts`

### Change Summary
```diff
- '2025-09-30T23:59:59Z'
+ '2025-10-31T23:59:59Z'
```

### Components Affected
1. **PressablePremiumPlanMigrationCard** (`client/a8c-for-agencies/components/pressable-premium-plan-migration/card/index.tsx`)
2. **PressablePremiumPlanMigrationBanner** (`client/a8c-for-agencies/components/pressable-premium-plan-migration/banner/index.tsx`)

Both components use the shared constant `migrationIncentiveEndDateString` which automatically updates to "October 31, 2025" based on the new end date.

### Display Logic
The banner visibility is controlled by `useShowMigrationIncentive()` hook which checks:
1. Agency has > 50 sites (or no sites value for backwards compatibility)
2. Current date < End date (October 31, 2025)

Both conditions must be true for the banner to display.
