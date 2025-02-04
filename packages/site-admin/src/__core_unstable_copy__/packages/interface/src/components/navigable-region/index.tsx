/**
 * External dependencies
 */
import { forwardRef } from '@wordpress/element';
import clsx from 'clsx';
/**
 * Internal dependencies
 */
import { unstableResourceWarning } from '../../../../../debug';
import type { ElementType } from 'react';

interface NavigableRegionProps {
	children: React.ReactNode;
	className?: string;
	ariaLabel: string;
	as?: ElementType;
	[ key: string ]: any;
}

const NavigableRegion = forwardRef< HTMLElement, NavigableRegionProps >(
	( { children, className, ariaLabel, as: Tag = 'div', ...props }, ref ) => {
		unstableResourceWarning(
			'<NavigableRegion />',
			'https://github.com/WordPress/gutenberg/tree/9f7d7dc52bb1ac42043f93a1e8bd243eddd5aa97/packages/interface/src/components/navigable-region'
		);

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
