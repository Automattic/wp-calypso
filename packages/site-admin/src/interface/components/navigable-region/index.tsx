/**
 * External dependencies
 */
import { forwardRef } from '@wordpress/element';

/**
 * A component that creates a navigable region in the interface.
 * Provides keyboard navigation support and proper ARIA attributes for accessibility.
 * @example
 * <NavigableRegion as="nav" ariaLabel="Main navigation">
 *   <Menu />
 * </NavigableRegion>
 */
type NavigableRegionProps = {
	children: React.ReactNode;
	ariaLabel: NonNullable< HTMLElement[ 'ariaLabel' ] >;
	as?: React.ElementType;
} & React.HTMLAttributes< HTMLElement >;

export const NavigableRegion = forwardRef< HTMLElement, NavigableRegionProps >(
	( { as: Tag = 'div', role = 'region', tabIndex = -1, ariaLabel, ...props }, ref ) => {
		return (
			<Tag ref={ ref } role={ role } tabIndex={ tabIndex } aria-label={ ariaLabel } { ...props } />
		);
	}
);

NavigableRegion.displayName = 'NavigableRegion';
