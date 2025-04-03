/**
 * External dependencies
 */
import { forwardRef } from '@wordpress/element';
import clsx from 'clsx';

type NavigableRegionProps = {
	children: React.ReactNode;
	className?: string;
	ariaLabel: string;
	as?: React.ElementType;
} & React.HTMLAttributes< HTMLElement >;

const NavigableRegion = forwardRef< HTMLElement, NavigableRegionProps >(
	( { children, className, ariaLabel, as: Tag = 'div', ...props }, ref ) => {
		return (
			<Tag
				ref={ ref }
				className={ clsx( 'interface-navigable-region', className ) }
				aria-label={ ariaLabel }
				role="region"
				tabIndex={ -1 }
				{ ...props }
			>
				{ children }
			</Tag>
		);
	}
);

NavigableRegion.displayName = 'NavigableRegion';
export default NavigableRegion;
