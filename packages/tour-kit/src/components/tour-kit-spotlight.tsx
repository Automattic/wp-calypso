import { useMemo, useState, useEffect } from '@wordpress/element';
import clsx from 'clsx';
import { usePopper } from 'react-popper';
import { LiveResizeConfiguration, liveResizeModifier } from '../utils/live-resize-modifier';
import Overlay from './tour-kit-overlay';
import {
	SpotlightInteractivity,
	SpotlightInteractivityConfiguration,
} from './tour-kit-spotlight-interactivity';
import type { Rect, Placement } from '@popperjs/core';

export const SPOTLIT_ELEMENT_CLASS = 'wp-tour-kit-spotlit';
interface Props {
	referenceElement: HTMLElement | null;
	styles?: React.CSSProperties;
	interactivity?: SpotlightInteractivityConfiguration;
	liveResize?: LiveResizeConfiguration;
}

const TourKitSpotlight: React.FunctionComponent< Props > = ( {
	referenceElement,
	styles,
	interactivity,
	liveResize,
} ) => {
	const [ popperElement, sePopperElement ] = useState< HTMLElement | null >( null );
	const referenceRect = referenceElement?.getBoundingClientRect();

	const modifiers = [
		{
			name: 'flip',
			enabled: false,
		},
		{
			name: 'preventOverflow',
			options: {
				mainAxis: false, // true by default
			},
		},
		useMemo(
			() => ( {
				name: 'offset',
				options: {
					offset: ( {
						placement,
						reference,
						popper,
					}: {
						placement: Placement;
						reference: Rect;
						popper: Rect;
					} ): [ number, number ] => {
						if ( placement === 'bottom' ) {
							return [ 0, -( reference.height + ( popper.height - reference.height ) / 2 ) ];
						}
						return [ 0, 0 ];
					},
				},
			} ),
			[]
		),
		// useMemo because https://popper.js.org/react-popper/v2/faq/#why-i-get-render-loop-whenever-i-put-a-function-inside-the-popper-configuration
		useMemo( () => {
			return liveResizeModifier( liveResize );
		}, [ liveResize ] ),
	];

	const { styles: popperStyles, attributes: popperAttributes } = usePopper(
		referenceElement,
		popperElement,
		{
			strategy: 'fixed',
			placement: 'bottom',
			modifiers,
		}
	);

	const clipDimensions = referenceRect
		? {
				width: `${ referenceRect.width }px`,
				height: `${ referenceRect.height }px`,
		  }
		: null;

	const clipRepositionProps = referenceElement
		? {
				style: {
					...( clipDimensions && clipDimensions ),
					...popperStyles?.popper,
					...( styles && styles ),
				},
				...popperAttributes?.popper,
		  }
		: null;

	/**
	 * Add a .wp-spotlit class to the referenced element so that we can
	 * apply CSS styles to it, for whatever purposes such as interactivity
	 */
	useEffect( () => {
		referenceElement?.classList.add( SPOTLIT_ELEMENT_CLASS );
		return () => {
			referenceElement?.classList.remove( SPOTLIT_ELEMENT_CLASS );
		};
	}, [ referenceElement ] );

	return (
		<>
			<SpotlightInteractivity { ...interactivity } />
			<Overlay visible={ ! clipRepositionProps } />
			<div
				className={ clsx( 'tour-kit-spotlight', {
					'is-visible': !! clipRepositionProps,
				} ) }
				ref={ sePopperElement }
				{ ...( clipRepositionProps as React.HTMLAttributes< HTMLDivElement > ) }
			/>
		</>
	);
};

export default TourKitSpotlight;
