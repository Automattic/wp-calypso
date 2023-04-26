import { getScrollContainer } from '@wordpress/dom';
import { useEffect, useRef, useCallback } from 'react';
import './pattern-action-bar-popover.scss';

interface Props {
	referenceElement: Element | null;
	children: JSX.Element;
}

const PatternActionBarPopover = ( { referenceElement, children }: Props ) => {
	const wrapperRef = useRef< HTMLDivElement | null >( null );
	const referenceRef = useRef< Element | null >( null );
	const updatePosition = useCallback( () => {
		const rect = referenceRef.current?.getBoundingClientRect();
		const nextY = Math.max( rect?.y || 0, 0 );
		wrapperRef.current?.style.setProperty( 'transform', `translateY(${ nextY }px)` );
	}, [ wrapperRef, referenceRef ] );

	referenceRef.current = referenceElement;

	useEffect( () => {
		if ( ! referenceRef.current || ! referenceRef.current?.ownerDocument?.defaultView ) {
			return;
		}

		const { defaultView } = referenceRef.current.ownerDocument;
		const scrollContainer = getScrollContainer( referenceRef.current );

		defaultView.addEventListener( 'resize', updatePosition );
		scrollContainer?.addEventListener( 'scroll', updatePosition );

		return () => {
			defaultView.removeEventListener( 'resize', updatePosition );
			scrollContainer?.removeEventListener( 'scroll', updatePosition );
		};
	}, [ referenceRef, updatePosition ] );

	useEffect( () => {
		updatePosition();
	}, [ referenceElement ] );

	return (
		<div ref={ wrapperRef } className="pattern-action-bar-popover">
			{ children }
		</div>
	);
};

export default PatternActionBarPopover;
