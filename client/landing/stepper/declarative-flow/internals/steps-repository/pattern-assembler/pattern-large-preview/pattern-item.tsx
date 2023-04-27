import { PatternRenderer } from '@automattic/block-renderer';
import { encodePatternId } from '../utils';
import type { Pattern } from '../types';
import type { MouseEvent } from 'react';

interface Props {
	pattern: Pattern | null;
	type: string;
	position?: number;
	onHover: ( element: HTMLElement | null ) => void;
}

const PatternItem = ( { pattern, type, position, onHover }: Props ) => {
	const handleMouseEnter = ( event: MouseEvent ) => {
		onHover( event.currentTarget as HTMLElement );
	};

	const handleMouseLeave = ( event: MouseEvent ) => {
		const { clientX, clientY } = event;
		const target = event.target as HTMLElement;
		const { offsetParent } = target;
		const { left, right, top, bottom } = target.getBoundingClientRect();

		// Use the position to determine whether the mouse leaves the current element or not
		// because the element is inside the iframe and we cannot get the next element from
		// the event.relatedTarget
		if (
			clientX <= Math.max( left, 0 ) ||
			clientX >= Math.min( right, offsetParent?.clientWidth || Infinity ) ||
			clientY <= Math.max( top, 0 ) ||
			clientY >= Math.min( bottom, offsetParent?.clientHeight || Infinity )
		) {
			onHover( null );
		}
	};

	if ( ! pattern ) {
		return null;
	}

	return (
		<div
			id={ pattern.key }
			data-type={ type }
			data-position={ position }
			onMouseEnter={ handleMouseEnter }
			onMouseLeave={ handleMouseLeave }
		>
			<PatternRenderer patternId={ encodePatternId( pattern.ID ) } isContentOnly />
		</div>
	);
};

export default PatternItem;
