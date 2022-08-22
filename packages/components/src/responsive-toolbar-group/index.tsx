import { useBreakpoint } from '@automattic/viewport-react';
import classnames from 'classnames';
import { ReactChild } from 'react';
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
}: {
	children: ReactChild[];
	className?: string;
	hideRatio?: number;
	showRatio?: number;
	rootMargin?: string;
	onClick?: ( index: number ) => void;
	initialActiveIndex?: number;
	swipeBreakpoint?: string;
} ) => {
	const classes = classnames( 'responsive-toolbar-group', className );

	const shouldSwipe = useBreakpoint( swipeBreakpoint );

	if ( shouldSwipe ) {
		return (
			<SwipeGroup
				className={ classes }
				initialActiveIndex={ initialActiveIndex }
				onClick={ onClick }
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
