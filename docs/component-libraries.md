# Component Libraries

If you find yourself asking "which `<Button>` component should I use when working with the Calypso repo?", then this is the document for you!

Admittedly, our components are quite disorganized and it’s not clear what should be used, and when. There are multiple versions of (allegedly) the same component, no design system, and no coherent design language to use in order to ensure we’re building a consistent user experience. Over the years, we’ve had different representations of a components team and initiatives to unify and use the same design language everywhere, but none of them really succeeded.

When figuring out which `<Button>` component to use, here are some guidelines you could consider:

- [`@wordpress/components`](https://wordpress.github.io/gutenberg) can be used for interfaces in the WordPress.org context (e.g. Block Editor).
- [`@automattic/components` and `client/components`](https://wpcalypso.wordpress.com/devdocs/design) can be used for interfaces in the WordPress.com context.
- [`client/blocks`](https://wpcalypso.wordpress.com/devdocs/blocks) represents more complex WordPress.com components that are usually composed from multiple UI components and are usually connected to the Redux state.

There may also be a more specific component library for the project you're working on (e.g. `@automattic/jetpack-components` and `@woocommerce/components`).

Ultimately, the correct `<Button>` component to use is dependent on the context, use case, constraints, and end goals. There isn't necessarily a correct answer. If you found it difficult to come to the right answer, feel free to ping @Automattic/team-calypso, and then include your insights here for the next person.
