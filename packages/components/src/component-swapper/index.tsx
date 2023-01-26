import { useBreakpoint } from '@automattic/viewport-react';
import React, { ReactChild, useEffect } from 'react';

const ComponentSwapper = ( {
	className,
	breakpoint = '<660px', // breakpoints from mediaQueryLists from '@automattic/viewport'
	breakpointActiveComponent,
	breakpointInactiveComponent,
	onSwap,
	children,
}: {
	children: ReactChild[];
	breakpoint: string;
	breakpointActiveComponent: React.Component;
	breakpointInactiveComponent: React.Component;
	onSwap?: () => void;
	className?: string;
} ) => {
	const isActive = useBreakpoint( breakpoint );

	useEffect( () => {
		onSwap?.();
	}, [ isActive, onSwap ] );

	return (
		<div className={ className }>
			{ isActive ? breakpointActiveComponent : breakpointInactiveComponent }
			{ children }
		</div>
	);
};

export default ComponentSwapper;
