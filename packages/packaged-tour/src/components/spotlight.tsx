import { useRef, useMemo } from '@wordpress/element';
import classnames from 'classnames';
import usePopperHandler from '../hooks/use-popper-handler';
import Overlay from './overlay';
import type { Rect, Placement } from '@popperjs/core';

interface Props {
	referenceElementSelector: string | null;
}

const Spotlight: React.FunctionComponent< Props > = ( { referenceElementSelector } ) => {
	const popperElementRef = useRef( null );
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
		referenceElementSelector,
		popperElementRef,
		modifiers
	);

	const clipRepositionProps = referenceElementSelector
		? {
				style: popperStyles?.popper,
				...popperAttributes?.popper,
		  }
		: null;

	return (
		<>
			<Overlay visible={ ! clipRepositionProps } />
			<div
				className={ classnames( 'packaged-tour__spotlight', {
					'--visible': !! clipRepositionProps,
				} ) }
				ref={ popperElementRef }
				{ ...clipRepositionProps }
			/>
		</>
	);
};

export default Spotlight;
