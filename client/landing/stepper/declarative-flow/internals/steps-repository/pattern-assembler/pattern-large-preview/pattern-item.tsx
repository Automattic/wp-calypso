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

	if ( ! pattern ) {
		return null;
	}

	return (
		<div
			id={ pattern.key }
			data-type={ type }
			data-position={ position }
			// The pattern is rendered inside the iframe. It's not easy to detect the mouse is going outside
			// since we want to keep the element is still hovering when the mouse is moving onto the action bar.
			// However, we cannot detect the mouse is moving onto the action bar due to the iframe limitation.
			// So, we handle the mouse leave event on the pattern overlay
			onMouseEnter={ handleMouseEnter }
		>
			<PatternRenderer patternId={ encodePatternId( pattern.ID ) } isContentOnly />
		</div>
	);
};

export default PatternItem;
