import { Button } from '@wordpress/components';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useCallback, useRef, useState } from 'react';

import './style.scss';

type Props = {
	className?: string;
	children: React.ReactNode;
};

export default function A4ACarousel( { children, className }: Props ) {
	const [ offsetX, setOffsetX ] = useState( 0 );
	const [ touchStart, setTouchStart ] = useState< number | null >( null );

	const contentRef = useRef< HTMLDivElement >( null );
	const containerRef = useRef< HTMLDivElement >( null );

	const containerWidth = containerRef.current?.clientWidth ?? 0;
	const contentWidth = contentRef.current?.clientWidth ?? 0;

	const maxOffset = Math.max( 0, contentWidth - containerWidth );

	const offsetStep = containerWidth;

	const moveLeft = useCallback( () => {
		setOffsetX( Math.min( offsetX + offsetStep, 0 ) );
	}, [ offsetStep, offsetX ] );

	const moveRight = useCallback( () => {
		setOffsetX( Math.max( offsetX - offsetStep, -maxOffset ) );
	}, [ offsetX, offsetStep, maxOffset ] );

	const onTouchStart = ( e: React.TouchEvent ) => {
		setTouchStart( e.targetTouches[ 0 ].clientX );
	};

	const onTouchMove = ( e: React.TouchEvent ) => {
		if ( ! touchStart ) {
			return;
		}

		const currentTouch = e.targetTouches[ 0 ].clientX;
		const distance = touchStart - currentTouch;

		// Calculate new offset based on touch movement
		const newOffset = Math.max( Math.min( offsetX - distance, 0 ), -maxOffset );

		setOffsetX( newOffset );
		setTouchStart( currentTouch );
	};

	const onTouchEnd = () => {
		setTouchStart( null );
	};

	return (
		<div className={ clsx( `a4a-carousel-wrapper`, className ) }>
			<div
				className={ clsx( 'a4a-carousel', { 'is-touch-active': !! touchStart } ) }
				ref={ containerRef }
				onTouchStart={ onTouchStart }
				onTouchMove={ onTouchMove }
				onTouchEnd={ onTouchEnd }
			>
				<div className="a4a-carousel__navigation">
					<Button
						className="a4a-carousel__navigation-button"
						onClick={ moveLeft }
						disabled={ offsetX === 0 }
					>
						<Icon icon={ chevronLeft } size={ 20 } />
					</Button>
					<Button
						className="a4a-carousel__navigation-button"
						onClick={ moveRight }
						disabled={ offsetX === -maxOffset }
					>
						<Icon icon={ chevronRight } size={ 20 } />
					</Button>
				</div>
				<div
					className="a4a-carousel__content"
					style={ { transform: `translateX(${ offsetX }px)` } }
					ref={ contentRef }
				>
					{ children }
				</div>
			</div>
		</div>
	);
}
