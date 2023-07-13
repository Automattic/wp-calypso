import { useResizeObserver } from '@wordpress/compose';
import { useLayoutEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

interface Props {
	className?: string;
	children: JSX.Element;
	isFullscreen?: boolean;
	enabled?: boolean;
}

const AnimatedFullscreen = ( { className, children, isFullscreen, enabled }: Props ) => {
	const positionerRef = useRef< HTMLDivElement | null >( null );
	const targetRef = useRef< HTMLDivElement | null >( null );
	const [ containerResizeListener, { width, height } ] = useResizeObserver();

	useLayoutEffect( () => {
		if ( ! enabled || ! positionerRef.current || ! targetRef.current ) {
			return;
		}

		const { offsetLeft, offsetTop, offsetHeight, offsetWidth } = positionerRef.current;
		targetRef.current.style.height = `${ offsetHeight }px`;
		targetRef.current.style.width = `${ offsetWidth }px`;
		targetRef.current.style.left = `${ offsetLeft }px`;
		targetRef.current.style.top = `${ offsetTop }px`;
	}, [ isFullscreen, width, height, enabled ] );

	if ( ! enabled ) {
		return <div className={ className }>{ children }</div>;
	}

	return (
		<>
			<div
				className={ className }
				ref={ positionerRef }
				style={ {
					opacity: 0,
					pointerEvents: 'none',
					zIndex: -1,
				} }
				aria-hidden="true"
			>
				{ containerResizeListener }
			</div>
			<div
				className={ className }
				ref={ targetRef }
				style={
					{
						position: 'absolute',
						transition: 'all 0.3s ease-out',
						isolation: 'isolate',
					} as CSSProperties
				}
			>
				{ children }
			</div>
		</>
	);
};

export default AnimatedFullscreen;
