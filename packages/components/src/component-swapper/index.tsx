import { useBreakpoint } from '@automattic/viewport-react';
import React, { ReactChild, useEffect } from 'react';

const ComponentSwapper = ( {
	className,
	breakpint = '<660px', // breakpoints from mediaQueryLists from '@automattic/viewport'
	breakpointActiveComponent,
	breakpointInactiveComponent,
	onSwap,
	children,
}: {
	children: ReactChild[];
	breakpint: string;
	breakpointActiveComponent: React.Component;
	breakpointInactiveComponent: React.Component;
	onSwap?: () => void;
	className?: string;
} ) => {
	const isActive = useBreakpoint( breakpint );

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
