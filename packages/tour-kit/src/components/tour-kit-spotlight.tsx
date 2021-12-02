import { useMemo, useRef } from '@wordpress/element';
import classnames from 'classnames';
import usePopperHandler from '../hooks/use-popper-handler';
import Overlay from './tour-kit-overlay';
import type { Rect, Placement } from '@popperjs/core';

interface Props {
	referenceElement: HTMLElement | null;
	styles?: React.CSSProperties;
}

const TourKitSpotlight: React.FunctionComponent< Props > = ( { referenceElement, styles } ) => {
	const popperElementRef = useRef( null );
	const referenceRect = referenceElement?.getBoundingClientRect();
	const modifiers = [
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

	const { styles: popperStyles, attributes: popperAttributes } = usePopperHandler(
		referenceElement,
		popperElementRef.current,
		modifiers
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
				ref={ popperElementRef }
				{ ...clipRepositionProps }
			/>
		</>
	);
};

export default TourKitSpotlight;
