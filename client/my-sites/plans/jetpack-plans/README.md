# Plans v2

This is the React component that renders a newer iteration of the Plans selection screen.

See: p1HpG7-8PX-p2

## Routes

Routes can have a customizable root, but are by default as follows:

- `/:duration?` - Selector, with optional billing cycle duration selected. Default is annual.

These are all defined in the [`index.ts`](https://github.com/automattic/wp-calypso/blob/3006a0e1f189703639c43df5a9a74737cd77a0f4/client/my-sites/plans/jetpack-plans/index.ts#L16-L20) file. This exports a function that accepts a root path string and [Page.js](https://visionmedia.github.io/page.js/) callbacks to be inserted before rendering the plans. See [the plans page](https://github.com/automattic/wp-calypso/blob/3006a0e1f189703639c43df5a9a74737cd77a0f4/client/my-sites/plans/index.js#L26-L42) for an implementation.

## Data Flow

The architecture of this section is designed to normalize the disparate data structures into a unified product type, called the `SelectorProduct`. This is done by ingesting plans from a source such as constants in libraries or an API, and transforming it into this type. The code for this parsing is in the [`itemToSelectorProduct`](https://github.com/automattic/wp-calypso/blob/cf0c02b4546086967d5263a36b46866727cf0d2f/client/my-sites/plans/jetpack-plans/utils.ts#L198-L258) function. This is run in the pages and flows into the `ProductCardWrapper` component for additional state information and wiring to the component UI.

This is designed as a foundation for an eventual switch to an API that would unify the disparate data types and enable things like conditional deals and A/B testing to occur without complex code changes.
