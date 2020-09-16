# Concierge

These components are used to render Business Concierge Sessions flows for booking, cancelling and
rescheduling appointments.

## Supported routes

```js
'/me/concierge'; // site selector step
'/me/concierge/:siteSlug/book'; // booking concierge appointment wizard
'/me/concierge/:siteSlug'; // redirects to calendar step for booking
'/me/concierge/:siteSlug/:appointmentId/cancel'; // cancellation page for concierge appointment
'/me/concierge/:siteSlug/:appointmentId/reschedule'; // rescheduling concierge appointments wizard
```

## Folder structure

`book/` - booking concierge appointments wizard components

`cancel/` - cancelling concierge appointments components

`reschedule/` - rescheduling concierge appointments wizard components

`shared/` - components that are shared between multiple flows

## Components

`ConciergeMain` multi step wrapper component that is used for both booking and rescheduling flows

`ConciergeCancel` wrapper component for cancellation flow
