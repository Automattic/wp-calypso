import type * as React from 'react';

// React 19's @types/react moved the `JSX` namespace under `React.JSX` and no
// longer exposes a global `JSX` namespace. Calypso still annotates many values
// with the bare global `JSX.Element` (and friends), so re-expose the namespace
// globally as an alias of `React.JSX` to keep those annotations valid.
declare global {
	namespace JSX {
		type ElementType = React.JSX.ElementType;
		type Element = React.JSX.Element;
		type ElementClass = React.JSX.ElementClass;
		type ElementAttributesProperty = React.JSX.ElementAttributesProperty;
		type ElementChildrenAttribute = React.JSX.ElementChildrenAttribute;
		type LibraryManagedAttributes< C, P > = React.JSX.LibraryManagedAttributes< C, P >;
		type IntrinsicAttributes = React.JSX.IntrinsicAttributes;
		type IntrinsicClassAttributes< T > = React.JSX.IntrinsicClassAttributes< T >;
		type IntrinsicElements = React.JSX.IntrinsicElements;
	}
}
