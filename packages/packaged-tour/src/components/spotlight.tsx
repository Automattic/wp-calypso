import { useMemo, useState } from '@wordpress/element';
import classnames from 'classnames';
import usePopperHandler from '../hooks/use-popper-handler';
import Overlay from './overlay';
import type { Rect, Placement } from '@popperjs/core';

interface Props {
	referenceElement: HTMLElement | null;
}

const Spotlight: React.FunctionComponent< Props > = ( { referenceElement } ) => {
	const [ popperElement, setPopperElement ] = useState< HTMLDivElement | null >( null );
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
		popperElement,
		modifiers
	);

	const clipRepositionProps = referenceElement
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
				ref={ setPopperElement }
				{ ...clipRepositionProps }
			/>
		</>
	);
};

export default Spotlight;
