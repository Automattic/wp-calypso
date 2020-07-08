# WPCOM React hooks

A useful collection of React hooks than can be useful when dealing with WPCOM APIs.

## Hooks list

### `useSiteCart`

React hook that asynchronously syncs the cart with the server. You can use it similar to the way you use `useState`. e.g

```js
const [ cart, setCart ] = Cart.useSiteCart( siteID );
```

`setCart` returns a promise that resolves to the server version of the cart (the up-to-date one).

**Caveat**: it can only be used in a signed in site (eg. in wp-admin).

#### Usage

```jsx
import { Cart } from '@automattic/wpcom-hooks';

function RenderCartProduct({ siteID }) {
    const [cart] = Cart.useSiteCart(siteID);

    return cart?.products.map(p => <li>{p.name}</li>);
}
```