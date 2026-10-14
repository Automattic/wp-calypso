import clsx from 'clsx';
import { useLayoutEffect, useRef, useState, FunctionComponent, ReactNode } from 'react';

import './grow-height.scss';

interface GrowHeightProps {
	children: ReactNode;
}

/**
 * Eases its height when its content grows; shrinking is immediate. The content is measured
 * because `height: auto` cannot be transitioned outside Chromium (`interpolate-size`).
 */
const GrowHeight: FunctionComponent< GrowHeightProps > = ( { children } ) => {
	const contentRef = useRef< HTMLDivElement >( null );
	const heightRef = useRef< number | undefined >( undefined );
	const [ height, setHeight ] = useState< number >();
	const [ isGrowing, setIsGrowing ] = useState( false );

	useLayoutEffect( () => {
		const content = contentRef.current;
		if ( ! content ) {
			return;
		}

		const observer = new ResizeObserver( () => {
			const next = content.offsetHeight;
			const previous = heightRef.current;
			heightRef.current = next;
			setIsGrowing( previous !== undefined && next > previous );
			setHeight( next );
		} );

		observer.observe( content );
		return () => observer.disconnect();
	}, [] );

	return (
		<div
			className={ clsx( 'stats-widget-grow-height', { 'is-growing': isGrowing } ) }
			style={ { height } }
			onTransitionEnd={ ( event ) => {
				// A row's own hover transition bubbles up here too.
				if ( event.target === event.currentTarget ) {
					setIsGrowing( false );
				}
			} }
		>
			<div ref={ contentRef }>{ children }</div>
		</div>
	);
};

export default GrowHeight;
