# Plans v2
This is the React component that renders a newer iteration of the Plans selection screen. This includes multi-step options, including upsells.

See: https://jetpackp2.wordpress.com/2020/03/31/jetpack-offer-reset/

## Components
There are three main components here:

- **Selector.tsx**: This is where people can select what product they want to purchase. It is typically the first screen people see.
- **Details.tsx**: This is where people choose the subtype of what product they want. For example: Jetpack Backup Daily or Real-time.
- **Upsell.tsx**: This is where people are displayed an upsell if there's a product that goes well together.

## Routes
Routes can have a customizable root, but are by default as follows:

- `/:duration?` - Selector, with optional billing cycle duration selected. Default is annual.
- `/:product/details` - The details page _without_ the duration set. Used for marketing pages.
- `/:product/:duration/details` - The details page.
- `/:product/:duration/additions` - The upsell page.
