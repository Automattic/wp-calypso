# CoreBadge Component

A wrapper component around WordPress's private `Badge` component from `@wordpress/components`.

## Usage

```jsx
import CoreBadge from 'calypso/components/core/badge';

function MyComponent() {
	return <CoreBadge>Badge Content</CoreBadge>;
}
```

## Important Notes

### Private API Usage

This component currently uses WordPress's private API through `@wordpress/private-apis`. The underlying `Badge` component is not yet part of the public API and may change or break in future versions of WordPress.

We will migrate to the public version of this component once it becomes available in `@wordpress/components`.

### Why a Wrapper?

1. **Centralized Private API Management**: Without this wrapper, we would need to duplicate the private API acknowledgment code everywhere the Badge is used. This wrapper centralizes the code in one place and makes it easier to track its usage.

2. **Future-Proofing**: When the Badge component becomes public, we'll only need to update this one wrapper component instead of finding and updating every direct usage throughout the codebase. This makes the eventual migration to the public API much simpler.

### Scope

For now, this component will remain in `client/components` (Calypso-only).

Products that run in dependency-extracted environments (e.g., Jetpack, WooCommerce) should unlock the private component on their own from their globally available version. We can consider company-wide sharing when a non-dependency-extracted product needs to use this component.

## Future Plans

Once the Badge component becomes publicly available in `@wordpress/components`, we should:

1. Remove the private API usage
2. Update this wrapper to use the public API
3. Eventually consider deprecating this wrapper in favor of direct Badge usage
