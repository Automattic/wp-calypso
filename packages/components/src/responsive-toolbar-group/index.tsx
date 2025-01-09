import { useBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { ReactNode } from 'react';
import DropdownGroup from './dropdown-group';
import SwipeGroup from './swipe-group';

import './style.scss';

const ResponsiveToolbarGroup = ( {
	children,
	className = '',
	hideRatio = 0.99,
	showRatio = 1,
	rootMargin = '0px',
	onClick = () => null,
	initialActiveIndex = -1,
	initialActiveIndexes,
	swipeBreakpoint = '<660px',
	hrefList = [],
	forceSwipe = false,
	swipeEnabled = true,
	isMultiSelection = false,
}: {
	children: ReactNode[];
	className?: string;
	hideRatio?: number;
	showRatio?: number;
	rootMargin?: string;
	onClick?: ( index: number ) => void;
	initialActiveIndex?: number;
	initialActiveIndexes?: number[];
	swipeBreakpoint?: string;

	/**
	 * List of href attributes
	 */
	hrefList?: string[];

	/**
	 * Rendering mode
	 */
	forceSwipe?: boolean;

	/**
	 * When false completely disables swipe at all breakpoints.
	 */
	swipeEnabled?: boolean;

	/**
	 * Whether to allow multiple selection.
	 */
	isMultiSelection?: boolean;
} ) => {
	const classes = clsx( 'responsive-toolbar-group', className );
	const isWithinBreakpoint = useBreakpoint( swipeBreakpoint );

	if ( forceSwipe || ( swipeEnabled && isWithinBreakpoint ) ) {
		return (
			<SwipeGroup
				className={ classes }
				initialActiveIndex={ initialActiveIndex }
				initialActiveIndexes={ initialActiveIndexes }
				onClick={ onClick }
				hrefList={ hrefList }
				isMultiSelection={ isMultiSelection }
			>
				{ children }
			</SwipeGroup>
		);
	}

	return (
		<DropdownGroup
			className={ classes }
			initialActiveIndex={ initialActiveIndex }
			initialActiveIndexes={ initialActiveIndexes }
			onClick={ onClick }
			hideRatio={ hideRatio }
			showRatio={ showRatio }
			rootMargin={ rootMargin }
			isMultiSelection={ isMultiSelection }
		>
			{ children }
		</DropdownGroup>
	);
};

export default ResponsiveToolbarGroup;
