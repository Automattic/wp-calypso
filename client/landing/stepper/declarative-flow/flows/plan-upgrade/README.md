# Plan Upgrade Flow

This stepper flow allows users to choose and upgrade to a new plan for their existing WordPress.com site.

## Overview

The plan upgrade flow is designed to provide a streamlined experience for existing site owners to upgrade their plan and proceed directly to checkout. It replaces the legacy `/plans` flow with a modern stepper-based approach.

### Query Parameters

- `siteSlug` - **Required** - The site slug for which to upgrade the plan
- `redirect_to` - URL to redirect to after checkout completion
- `feature` - Filter out all plans which don't provide this feature.

### Flow Steps

1. **Plan Selection**
   - Displays available plan upgrades for the existing site using `plans-upgrade` intent
   - Shows current plan + higher-tier plans only (no downgrades)
   - Current plan displays "Your plan" as non-clickable indicator
   - Any upgrade credits are displayed on-screen.
   - Proceeds directly to checkout after plan selection

## Testing Instructions

1.  Go to /setup/plan-upgrade?siteSlug=foo.wordpress.com where foo is a site you admin
2.  You should see the plans grid, if the site already has a plan, then it should only show that plan and plans you can upgrade to.
3.  You should be able to select and checkout a plan.

## Owned by

Hosting Platform team (@dsas)

## Context

<https://wp.me/p58i-nge>
