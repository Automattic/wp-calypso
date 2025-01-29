import { Button } from '@wordpress/components';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useCallback, useRef, useState } from 'react';

import './style.scss';

// Minimum swipe distance in pixels to trigger navigation
const MIN_SWIPE_DISTANCE = 50;

type Props = {
	className?: string;
	children: React.ReactNode;
};

export default function A4ACarousel( { children, className }: Props ) {
	const [ offsetX, setOffsetX ] = useState( 0 );
	const [ touchStart, setTouchStart ] = useState< number | null >( null );
	const [ touchEnd, setTouchEnd ] = useState< number | null >( null );

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
		setTouchEnd( null );
		setTouchStart( e.targetTouches[ 0 ].clientX );
	};

	const onTouchMove = ( e: React.TouchEvent ) => {
		setTouchEnd( e.targetTouches[ 0 ].clientX );
	};

	const onTouchEnd = () => {
		if ( ! touchStart || ! touchEnd ) {
			return;
		}

		const distance = touchStart - touchEnd;
		const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
		const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

		if ( isLeftSwipe ) {
			moveRight();
		}
		if ( isRightSwipe ) {
			moveLeft();
		}
	};

	return (
		<div className={ clsx( `a4a-carousel-wrapper`, className ) }>
			<div
				className="a4a-carousel"
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
