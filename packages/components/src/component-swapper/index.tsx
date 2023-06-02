import { useBreakpoint } from '@automattic/viewport-react';
import { ReactNode, useEffect } from 'react';

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
	breakpointActiveComponent: ReactNode;
	breakpointInactiveComponent: ReactNode;
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
