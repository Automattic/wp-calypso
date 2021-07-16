# Concierge

These components are used to render Business Concierge Sessions flows for booking, cancelling and
rescheduling appointments.

## Supported routes

```js
'/me/quickstart'; // site selector step
'/me/quickstart/:siteSlug/book'; // booking concierge appointment wizard
'/me/quickstart/:siteSlug'; // redirects to calendar step for booking
'/me/quickstart/:siteSlug/:appointmentId/cancel'; // cancellation page for concierge appointment
'/me/quickstart/:siteSlug/:appointmentId/reschedule'; // rescheduling concierge appointments wizard
```

## Folder structure

`book/` - booking concierge appointments wizard components

`cancel/` - cancelling concierge appointments components

`reschedule/` - rescheduling concierge appointments wizard components

`shared/` - components that are shared between multiple flows

## Components

`ConciergeMain` multi step wrapper component that is used for both booking and rescheduling flows

`ConciergeCancel` wrapper component for cancellation flow
