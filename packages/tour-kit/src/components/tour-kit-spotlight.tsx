import { useMemo, useState } from '@wordpress/element';
import classnames from 'classnames';
import { usePopper } from 'react-popper';
import Overlay from './tour-kit-overlay';
import type { Rect, Placement } from '@popperjs/core';

interface Props {
	referenceElement: HTMLElement | null;
	styles?: React.CSSProperties;
}

const TourKitSpotlight: React.FunctionComponent< Props > = ( { referenceElement, styles } ) => {
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

	return (
		<>
			<Overlay visible={ ! clipRepositionProps } />
			<div
				className={ classnames( 'tour-kit-spotlight', {
					'--visible': !! clipRepositionProps,
				} ) }
				ref={ sePopperElement }
				{ ...clipRepositionProps }
			/>
		</>
	);
};

export default TourKitSpotlight;
