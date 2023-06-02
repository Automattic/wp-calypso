# TrackPurchasePageView

This component fire a single tracks event with the provided `eventName` prop.

The provided `purchaseId` will be used to retrieve a purchase from state. Its product slug will be used for the event property `product_slug`.

## Props

### `eventName` (string)

The event name used to track the purchase page view.

### `purchaseId` (number)

A purchase ID that will be used to look up a purchase in state and retrieve its product slug for tracking.
