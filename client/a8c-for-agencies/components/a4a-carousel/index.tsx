import { Button } from '@wordpress/components';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useCallback, useRef, useState } from 'react';

import './style.scss';

type Props = {
	className?: string;
	children: React.ReactNode;
};

const OFFSET_X_STEP = 500;

export default function A4ACarousel( { children, className }: Props ) {
	const [ offsetX, setOffsetX ] = useState( 0 );

	const contentRef = useRef< HTMLDivElement >( null );
	const containerRef = useRef< HTMLDivElement >( null );

	const containerWidth = containerRef.current?.clientWidth ?? 0;
	const contentWidth = contentRef.current?.clientWidth ?? 0;

	const maxOffset = Math.max( 0, contentWidth - containerWidth );

	const moveLeft = useCallback( () => {
		setOffsetX( Math.min( offsetX + OFFSET_X_STEP, 0 ) );
	}, [ offsetX ] );

	const moveRight = useCallback( () => {
		setOffsetX( Math.max( offsetX - OFFSET_X_STEP, -maxOffset ) );
	}, [ offsetX, maxOffset ] );

	return (
		<div className={ clsx( `a4a-carousel-wrapper`, className ) }>
			<div className="a4a-carousel" ref={ containerRef }>
				<div className="a4a-carousel__navigation">
					<Button
						className="a4a-carousel__navigation-button"
						onClick={ moveLeft }
						disabled={ offsetX === 0 }
					>
						<Icon icon={ chevronLeft } />
					</Button>
					<Button
						className="a4a-carousel__navigation-button"
						onClick={ moveRight }
						disabled={ offsetX === -maxOffset }
					>
						<Icon icon={ chevronRight } />
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
