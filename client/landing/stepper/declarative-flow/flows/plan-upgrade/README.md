# Plan Upgrade Flow

This stepper flow allows users to choose and upgrade to a new plan for their existing WordPress.com site.

## Overview

The plan upgrade flow is designed to provide a streamlined experience for existing site owners to upgrade their plan and proceed directly to checkout. It replaces the legacy `/plans` flow with a modern stepper-based approach.

## Flow Configuration

- **Flow Name**: `plan-upgrade`
- **Route**: `/setup/plan-upgrade?siteSlug=yoursite.wordpress.com`
- **Authentication**: Required (automatically handled by stepper framework)
- **Authorization**: Requires `manage_options` capability for the target site

## URL Parameters

### Query Parameters

- `siteSlug` - **Required** - The site slug for which to upgrade the plan
- `redirect_to` - URL to redirect to after checkout completion

### URL Format

The flow uses query parameters (not path parameters) for the site slug:

- `http://calypso.localhost:3000/setup/plan-upgrade?siteSlug=yoursite.wordpress.com`
- `http://calypso.localhost:3000/setup/plan-upgrade/plans?siteSlug=yoursite.wordpress.com` (direct to plans step)

## Flow Steps

1. **Plans Selection** (`unified-plans`)
   - Displays available plan upgrades for the existing site using `plans-upgrade` intent
   - Shows current plan + higher-tier plans only (no downgrades)
   - Current plan displays "Your plan" as non-clickable indicator
   - Integrates with existing plan comparison and selection logic
   - Proceeds directly to checkout after plan selection

Note: Error handling is done via redirects rather than an error step, following the pattern of other simple flows.

## Authorization

The flow uses `useAssertConditions()` to verify:

1. **Site Identifier**: Either `siteSlug` or `siteId` must be provided
2. **Site Existence**: The site must exist and be accessible
3. **User Permissions**: User must have `manage_options` capability for the site

Users without proper authorization are shown an appropriate error message.

## Checkout Integration

After plan selection, users are redirected directly to checkout with:

- URL format: `/checkout/{siteSlug}/{planSlug}`
- Preserves `redirect_to` parameter for post-checkout redirection
- No `signup=1` parameter (since this is an existing site upgrade)

## Testing Instructions

### Prerequisites

- WordPress.com account with access to at least one site
- Sites with different permission levels for testing authorization

### Manual Test Cases

1. **Happy Path**

   ```
   /setup/plan-upgrade?siteSlug=yoursite.wordpress.com
   ```

   - Should display plan selection for existing site
   - Should show only current plan + upgrade options (no downgrades)
   - Current plan should show "Your plan" instead of upgrade button
   - Should proceed to checkout after plan selection

2. **Direct to Plans Step**

   ```
   /setup/plan-upgrade/plans?siteSlug=yoursite.wordpress.com
   ```

   - Should go directly to the plans selection step

3. **With Redirect Parameter**

   ```
   /setup/plan-upgrade?siteSlug=yoursite.wordpress.com&redirect_to=/home
   ```

   - Should pass redirect parameter through to checkout
   - After checkout completion, user should be redirected to the specified URL

4. **Authorization Tests**

   - **No site provided**: Should redirect to homepage
   - **Invalid site**: Should display error
   - **No manage_options permission**: Should display authorization error
   - **Anonymous user**: Should redirect to login, then back to flow

5. **Edge Cases**
   - **Malformed URLs**: Should handle gracefully
   - **Non-existent sites**: Should display appropriate error

### Test Data Requirements

- Test sites with different plan levels
- User accounts with varying permission levels
- Sites that allow/disallow plan changes

## Implementation Notes

- Uses FlowV2 interface with session support
- Leverages existing `unified-plans` step for plan selection
- Authorization handled at flow level via `useAssertConditions()`
- Direct checkout navigation without intermediate processing
- Follows established stepper patterns and conventions
