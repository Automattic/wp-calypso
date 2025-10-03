# Domain Search

This package exports the UI elements to be used in the domain search experiences across Automattic. They are an agnostic UI library, following the WordPress Design System, designed to bring consistency across products.

## Installation

```sh
yarn add @automattic/domain-search
```

## Usage

```tsx
import { DomainSearch } from '@automattic/domain-search';
```

The `DomainSearch` component is the main entry point for the domain search experience. It is a wrapper that manages the state of the domain search and provides the necessary context for the other components.

From there, you can compose the UI by using the components provided by this package, such as `DomainSearchControls` and `DomainSuggestions`.

Each component is exported as a compound component, meaning that you can render different parts of the UI if you want to and mix and match them. For example, in WordPress.com we will render some information about plans in the cart. Here's how we would do that:

```tsx
<DomainSearch>
	{ /* The main content of the domain search experience. Check out the `DomainSearch.stories.tsx` file for more components. */ }
	<DomainsFullCart>
		{ translate( 'Free domain with a selected plan' ) }
		<DomainsFullCart.Items />
		{ translate( 'Check out our 100 year domain offer' ) }
	</DomainsFullCart>
</DomainSearch>
```

But that's optional! You can just render the `<DomainsFullCart />` component by itself, and it will render the cart with the items without any additional content.
