# Shopping Cart

This is a library for accessing the WordPress.com shopping cart.

An older version of this interface exists in calypso's `lib/cart` directory, but that version is deprecated.

This package provides the following API, as well as a comprehensive set of TypeScript types for the data passed through the cart. Notably, the whole cart object itself is a `ResponseCart` containing `ResponseCartProduct` objects. If adding a new product, the `RequestCart` and `RequestCartProduct` can be used instead (they have fewer required properties).

Every cart is keyed by a cart key; usually this is the numeric WordPress.com site ID. It can also be `'no-site'` or `'no-user'`. If `undefined`, the cart will not be loaded and the `isLoading` value will be permanently `true`; this can be used to temporarily disable the cart.

If the site ID is not available, but the site slug is available, the helper function `getCartKeyForSiteSlug` can be used on the [ShoppingCartManagerClient](#createShoppingCartManagerClient) to transform it into a site ID.

## ShoppingCartProvider

A React context provider component which should be used near the top level of the render tree to grant access to the shopping cart to the components in the tree via the [useShoppingCart](#useShoppingCart) hook or the [withShoppingCart](#withShoppingCart) higher-order-component.

It requires the following props:

- `managerClient: ShoppingCartManagerClient`. The cart manager system. Create one with [createShoppingCartManagerClient](#createShoppingCartManagerClient).
- `options?: { refetchOnWindowFocus?: boolean, defaultCartKey?: number | 'no-site' | 'no-user' | undefined }`. Optional. `refetchOnWindowFocus` can be used to trigger `getCart` when the window or tab is hidden and then refocused. `defaultCartKey` can be used to provide a cart key that will be used instead of `undefined` when no cart key is passed to `useShoppingCart` or `withShoppingCart`.

## useShoppingCart

This is a React hook that can be used in any child component under [ShoppingCartProvider](#ShoppingCartProvider) to return a `UseShoppingCart` object. `useShoppingCart` requires one argument:

- `cartKey: number | 'no-site' | 'no-user' | undefined`. The current cart key to use. If undefined, the cart will not be loaded, although an empty cart and noop functions will still be provided as a return value.

The `UseShoppingCart` object contains the following properties. Note that the action functions in this object are requests only; they do not guarantee that the request will be fulfilled by the shopping cart API.

- `responseCart: ResponseCart`. The full cart object itself. For this object's API, see the TypeScript type. This object should be considered **read-only**. To make changes to the cart, use the action functions in `UseShoppingCart` like `addProductsToCart`.
- `isLoading: boolean`. True if the cart is still loading from the server. This will only be true during the initial load for a `cartKey` or when the `cartKey` is `undefined|null`. When updating an existing cart, `isPendingUpdate` will be true instead.
- `isPendingUpdate: boolean`. True if the cart is loading in any way, either during its initial load, when a `cartKey` changes, or when a modification request is pending.
- `loadingError: string | null | undefined`. If fetching or updating the cart causes an error, this will be a string that contains the error message.
- `loadingErrorType: ShoppingCartError | undefined`. If fetching or updating the cart causes an error, this will contain a string that explains what type of error.
- `couponStatus: 'fresh' | 'pending' | 'applied' | 'rejected'. A string that can be used to determine if a coupon is applied.

The following actions are also properties. Each one returns a Promise that resolves when the cart is next valid (this may be after several queued actions are complete).

If there are errors returned by the cart endpoint (the `responseCart.messages.errors`), or if there is an error during the request (`loadingError`), the Promise will be rejected. The argument passed to the rejection will an instance of `CartActionConnectionError` or `CartActionResponseError` (both subclasses of `CartActionError`) with a `code` and a `message` property.

Regardless, it's a good idea to always check `responseCart.messages.errors` and the `loadingError` property on the cart manager after any state change!

- `addProductsToCart: ( products: RequestCartProduct[] ) => Promise<ResponseCart>`. A function that requests adding new products to the cart. May cause the cart to be replaced instead, depending on the RequestCartProducts (mostly renewals and non-renewals cannot co-exist in the cart at the same time).
- `removeProductFromCart: ( uuidToRemove: string ) => Promise<ResponseCart>`. A function that requests removing a product from the cart.
- `applyCoupon: ( couponId: string ) => Promise<ResponseCart>`. A function that requests applying a coupon to the cart (only one coupon can be applied at a time).
- `removeCoupon: () => Promise<ResponseCart>`. A function that requests removing a coupon to the cart.
- `updateLocation: ( location: LocationUpdate ) => Promise<ResponseCart>`. A function that can be used to change the tax location of the cart. Note that this completely replaces the current location. The [convertTaxLocationToLocationUpdate](#convertTaxLocationToLocationUpdate) function can be used to convert the current `responseCart.tax.location` value into the properties required by this function if you need to only update one value.
- `replaceProductInCart: ( uuidToReplace: string, productPropertiesToChange: Partial< RequestCartProduct > ) => Promise<ResponseCart>`. A function that can replace one product in the cart with another, retaining the same UUID; useful for changing product variants.
- `replaceProductsInCart: ( products: RequestCartProduct[] ) => Promise<ResponseCart>`. A function that replaces all the products in the cart with a new set of products. Can also be used to clear the cart.
- `reloadFromServer: () => Promise<ResponseCart>`. A function to throw away the current cart cache and fetch it fresh from the shopping cart API.
- `clearMessages: () => Promise<ResponseCart>`. A function to throw away the current `responseCart.messages`. This can be used to clear messages once they have been displayed.

## withShoppingCart

A React HOC (higher order component) that can be used to inject the `UseShoppingCart` into another component for use when `useShoppingCart` cannot be used (ie: in a class component).

A component wrapped by this HOC will receive the following additional props:

- `shoppingCartManager: UseShoppingCart`. This object is the same as the value returned by [useShoppingCart](#useShoppingCart).
- `cart: ResponseCart`. A convenience prop which is equal to `shoppingCartManager.responseCart`.

The HOC has the following arguments. In order to set the cart key, you must provide the second argument to the HOC, `mapPropsToCartKey`.

- `Component: React.ComponentType`. The component to wrap; it will receive the additional props above.
- `mapPropsToCartKey?: ( props ) => number | 'no-site' | 'no-user' | undefined`. A function that can be used to set the current cart key based on the component's props. If not set, it will try to use `props.cartKey`.

## createRequestCartProduct

A helper function that creates a `RequestCartProduct`, which can then be passed to shopping cart functions like `addProductsToCart()`.

It takes one argument, an object which contains some or all of the properties in a `RequestCartProduct`, but must contain at least `product_slug` and `product_id`. The remaining properties, if not set, will be filled with the default values.

## getEmptyResponseCart

A function that returns an empty but valid `ResponseCart` object. Useful for tests where we need to mock the shopping cart response.

## getEmptyResponseCartProduct

A function that returns an empty but valid `ResponseCartProduct` object. Useful for tests where we need to mock the shopping cart response.

## convertResponseCartToRequestCart

A function that converts a `ResponseCart` to a `RequestCart`. Usually this should be handled by the shopping cart manager but if you need to manupulate a cart object manually this may be helpful.

## createShoppingCartManagerClient

A function to create a `ShoppingCartManagerClient` which is the state management system used by the `shopping-cart` package. It's recommended to create this as a singleton and share it across your entire application.

An options object can be passed in with the following optional properties:

- `getCart?: ( cartKey: number | 'no-site' | 'no-user' ) => Promise< ResponseCart >`. This is an async function that will fetch the cart from the server.
- `setCart?: ( cartKey: number | 'no-site' | 'no-user', requestCart: RequestCart ) => Promise< ResponseCart >`. This is an async function that will send an updated cart to the server.

Once created, the `ShoppingCartManagerClient` has the properties:

- `forCartKey: ( cartKey: number | 'no-site' | 'no-user' | undefined ) => ShoppingCartManager`. A function to return a `ShoppingCartManager` for a given cart key. If provided an `undefined` cart key, a `ShoppingCartManager` will still be returned, but its cart will always be loading and empty and its actions will do nothing.
- `getCartKeyForSiteSlug: ( siteSlug: string ) => Promise< number | 'no-site' | 'no-user' >`. A function to query the server to transform a site slug into a cart key.

A `ShoppingCartManager` has the following properties:

- `getState: () => ShoppingCartManagerState`. A function to return the current state of the cart. This includes all the state properties returned by [useShoppingCart](#useShoppingCart).
- `actions: ShoppingCartManagerActions`. An object whose properties are the various actions that can be taken on the cart. They are the same as the actions returned by [useShoppingCart](#useShoppingCart).
- `subscribe: ( callback: () => void ) => () => void`. A function to subscribe to updates to a `ShoppingCartManager` for a given cart key. The `callback` will be called any time the `ShoppingCartManager` changes for that key. The return value of the function is an unsubscribe function.
- `fetchInitialCart: () => Promise<ResponseCart>`. A function that should be called after the cart manager is created in order to perform the initial fetch. If another action is called first, this will be called automatically before that action is dispatched.

## convertTaxLocationToLocationUpdate

Converts the `responseCart.tax.location` data in a `ResponseCart` to the data required by the `updateLocation()` cart action.
