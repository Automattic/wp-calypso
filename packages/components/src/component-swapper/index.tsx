import { useBreakpoint } from '@automattic/viewport-react';
import React, { ReactNode, useEffect } from 'react';

const ComponentSwapper = ( {
	className,
	breakpoint = '<660px', // breakpoints from mediaQueryLists from '@automattic/viewport'
	breakpointActiveComponent,
	breakpointInactiveComponent,
	onSwap,
	children,
}: {
	children?: ReactNode;
	breakpoint: string;
	breakpointActiveComponent: React.ReactElement;
	breakpointInactiveComponent: React.ReactElement;
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
