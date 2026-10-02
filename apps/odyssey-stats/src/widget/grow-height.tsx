import clsx from 'clsx';
import { useLayoutEffect, useRef, useState, FunctionComponent, ReactNode } from 'react';

import './grow-height.scss';

interface GrowHeightProps {
	className?: string;
	children: ReactNode;
}

/**
 * Eases its height when its content grows, such as a list filling in after its
 * one-row skeleton; shrinking is immediate.
 *
 * `height: auto` cannot be transitioned in every browser yet (`interpolate-size` is
 * Chromium-only), so the content is measured and the wrapper is given that height
 * explicitly, which can be.
 */
const GrowHeight: FunctionComponent< GrowHeightProps > = ( { className, children } ) => {
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
			className={ clsx( 'stats-widget-grow-height', { 'is-growing': isGrowing }, className ) }
			style={ { height } }
			onTransitionEnd={ ( event ) => {
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
