import { useMergeRefs, useResizeObserver } from '@wordpress/compose';
import { useLayoutEffect, useRef, useState } from 'react';

let canvasContext: CanvasRenderingContext2D | null = null;

const measureText = ( text: string, font: string ) => {
	canvasContext ??= document.createElement( 'canvas' ).getContext( '2d' );

	if ( ! canvasContext ) {
		return 0;
	}

	canvasContext.font = font;

	return canvasContext.measureText( text ).width;
};

/**
 * The middle-truncation `limit` for the Text component that fits the label in
 * the space left in the name column, or 0 when the whole label fits.
 */
export const useNamePulseLabelLimit = ( label: string ) => {
	const nameRef = useRef< HTMLElement | null >( null );
	const labelRef = useRef< HTMLElement | null >( null );
	const [ limit, setLimit ] = useState( 0 );

	const measure = () => {
		const name = nameRef.current;
		const labelElement = labelRef.current;
		const lastChild = name?.lastElementChild;

		if ( ! name || ! labelElement || ! lastChild ) {
			return;
		}

		// The label's width plus the free space at the end of the name column.
		const available =
			labelElement.getBoundingClientRect().width +
			name.getBoundingClientRect().right -
			lastChild.getBoundingClientRect().right;

		// No layout, e.g. in tests.
		if ( ! available ) {
			return;
		}

		const { fontWeight, fontSize, fontFamily } = getComputedStyle( labelElement );
		const font = `${ fontWeight } ${ fontSize } ${ fontFamily }`;

		if ( measureText( label, font ) <= available ) {
			setLimit( 0 );
			return;
		}

		let half = Math.floor( ( label.length - 1 ) / 2 );

		while (
			half > 1 &&
			measureText( `${ label.slice( 0, half ) }…${ label.slice( -half ) }`, font ) > available
		) {
			half--;
		}

		setLimit( half * 2 );
	};

	useLayoutEffect( measure );
	const resizeRef = useResizeObserver( measure );

	return { nameRef: useMergeRefs( [ nameRef, resizeRef ] ), labelRef, limit };
};
