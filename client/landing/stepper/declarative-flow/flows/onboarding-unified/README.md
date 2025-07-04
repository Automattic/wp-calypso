# Onboarding Unified Flow

A unified, optimized onboarding flow designed for multiple acquisition channels including Paid Media (PM) and Affiliate scenarios.

## Purpose

This flow unifies and optimizes the onboarding experience across acquisition channels by:

- Reducing the number of separate onboarding flows
- Aligning user experience across PM and Affiliate channels
- Leveraging affiliate optimizations (fewer steps, clearer commerce messaging)
- Enabling better A/B testing for paid campaigns
- Using the Stepper framework for improved maintenance

## Features

- **Minimal friction**: Only plans → checkout (no domain selection)
- **Business focus**: Only business and commerce plans shown
- **Siteless checkout**: Site created after payment, not before
- **No login required**: Users authenticate during checkout
- **Channel-aware**: Different behavior for PM vs Affiliate traffic
- **Conversion optimized**: Yearly plans default, clear commerce messaging

## Testing Steps

### Basic Flow Test

1. Navigate to `/setup/onboarding-unified`
2. Verify only business and commerce plans are shown
3. Select a plan and proceed to checkout
4. **Verify redirect to `/checkout/unified?signup=1&flow=onboarding-unified`**
5. **Verify no site selection step appears in checkout**
6. Complete checkout (use test payment methods in staging)
7. Verify site is created after successful payment
8. Verify user gets auto-generated wordpress.com subdomain

### Edge Cases

1. Test abandoned checkout - no sites created, no cleanup needed
2. Test payment failure - ensure graceful error handling
3. Test affiliate vs PM detection - verify coupon visibility
4. Test plan filtering - ensure only business/commerce plans show
5. Test siteless checkout flow - verify site creation post-payment

## Flow Structure

- **Landing page** → **Plans step** → **Siteless checkout**
- Plans step: Choose business or commerce plan only
- Checkout: User signs up/in and completes payment
- Post-checkout: Site created with auto-generated subdomain
- Domain selection happens during site launch flow

## Channel Differentiation

- **PM traffic**: Coupon input hidden for cleaner experience
- **Affiliate traffic**: Coupon input shown (detected via `ref` or `utm_source` params)
- **Detection**: URL parameters containing "affiliate" identify affiliate traffic

## Technical Implementation

- **Bypass site selection**: Registered in controller.js to skip site selection logic
- **Post-checkout site creation**: Site built after successful payment
- **Auto-generated subdomain**: Sites get `*.wordpress.com` subdomain initially
- **Plan filtering**: Only business-bundle and ecommerce-bundle plans shown
- **Framework**: Built using Stepper v2 framework for maintainability
