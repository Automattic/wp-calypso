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
	swipeBreakpoint = '<660px',
	hrefList = [],
	forceSwipe = false,
	swipeEnabled = true,
}: {
	children: ReactNode[];
	className?: string;
	hideRatio?: number;
	showRatio?: number;
	rootMargin?: string;
	onClick?: ( index: number ) => void;
	initialActiveIndex?: number;
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
} ) => {
	const classes = clsx( 'responsive-toolbar-group', className );
	const isWithinBreakpoint = useBreakpoint( swipeBreakpoint );

	if ( forceSwipe || ( swipeEnabled && isWithinBreakpoint ) ) {
		return (
			<SwipeGroup
				className={ classes }
				initialActiveIndex={ initialActiveIndex }
				onClick={ onClick }
				hrefList={ hrefList }
			>
				{ children }
			</SwipeGroup>
		);
	}

	return (
		<DropdownGroup
			className={ classes }
			initialActiveIndex={ initialActiveIndex }
			onClick={ onClick }
			hideRatio={ hideRatio }
			showRatio={ showRatio }
			rootMargin={ rootMargin }
		>
			{ children }
		</DropdownGroup>
	);
};

export default ResponsiveToolbarGroup;
