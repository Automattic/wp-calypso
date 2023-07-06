import { useLayoutEffect, useState, useRef } from 'react';

interface Props {
	className?: string;
	children: JSX.Element;
	isFullscreen?: boolean;
	enabled?: boolean;
}

const AnimatedFullscreen = ( { className, children, isFullscreen, enabled }: Props ) => {
	const positionerRef = useRef< HTMLDivElement | null >( null );
	const targetRef = useRef< HTMLDivElement | null >( null );
	const [ style, setStyle ] = useState( {} );

	useLayoutEffect( () => {
		if ( ! enabled || ! positionerRef.current || ! targetRef.current ) {
			return;
		}

		const { width, height, left, top } = positionerRef.current.getBoundingClientRect();

		setStyle( {
			position: 'absolute',
			left: 0,
			top: 0,
			width,
			height,
			transform: `translate(${ left }px, ${ top }px)`,
			transformOrigin: 'center center',
			transition: 'transform 0.15s linear',
		} );
	}, [ isFullscreen, enabled ] );

	if ( ! enabled ) {
		return <div className={ className }>{ children }</div>;
	}

	return (
		<>
			<div className={ className } ref={ positionerRef } />
			<div className={ className } ref={ targetRef } style={ style }>
				{ children }
			</div>
		</>
	);
};

export default AnimatedFullscreen;
