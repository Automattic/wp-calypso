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
	className?: string;
	ariaLabel: string;
	as?: React.ElementType;
} & React.HTMLAttributes< HTMLElement >;

export const NavigableRegion = forwardRef< HTMLElement, NavigableRegionProps >(
	( { children, className, ariaLabel, as: Tag = 'div', ...props }, ref ) => {
		return (
			<Tag ref={ ref } aria-label={ ariaLabel } role="region" tabIndex={ -1 } { ...props }>
				{ children }
			</Tag>
		);
	}
);

NavigableRegion.displayName = 'NavigableRegion';
