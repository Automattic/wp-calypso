/* eslint-disable react/no-danger */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { OutputSize } from '../types';

type Props = {
	html: string;
	size: OutputSize;
	className?: string;
	ariaLabel?: string;
	prepareContent?: ( element: HTMLElement ) => void | Promise< void >;
};

export function HtmlRenderPreview( { html, size, className, ariaLabel, prepareContent }: Props ) {
	const frameRef = useRef< HTMLDivElement >( null );
	const innerRef = useRef< HTMLDivElement >( null );
	const [ scale, setScale ] = useState( 1 );

	useEffect( () => {
		const frame = frameRef.current;
		if ( ! frame ) {
			return;
		}
		const updateScale = () => {
			const next = frame.clientWidth / size.width;
			if ( Number.isFinite( next ) && next > 0 ) {
				setScale( next );
			}
		};
		updateScale();
		const observer = new ResizeObserver( updateScale );
		observer.observe( frame );
		return () => observer.disconnect();
	}, [ size.width ] );

	// Layout effect (not passive) so the markup reset + hide land before the
	// browser paints — otherwise the raw, unfitted page flashes for one frame.
	useLayoutEffect( () => {
		const inner = innerRef.current;
		if ( ! inner || ! prepareContent ) {
			return;
		}
		// Reset to the unfitted markup before fitting. React's
		// dangerouslySetInnerHTML only re-applies when `html` changes, so on a
		// rerun the DOM still holds the previous (mutated) fit — start
		// fresh so the fit measures original sizes, not already-shrunk ones.
		inner.innerHTML = html;
		// The fit pipeline is async and runs in multiple passes (an initial fit,
		// then a re-fit once fonts settle). Each pass reflows the page, so showing
		// them produces a visible flicker on every cover switch / view toggle.
		// Hide the page until the fit settles and reveal it once.
		let active = true;
		inner.style.opacity = '0';
		const reveal = () => {
			// A superseding refit (or unmount) marks this run inactive — don't let a
			// stale pass reveal half-fitted content over the current one.
			if ( active ) {
				inner.style.opacity = '1';
			}
		};
		// Safety net: if the async fit ever stalls (a stuck image/font wait),
		// reveal anyway so the page can never be left permanently invisible.
		const fallback = window.setTimeout( reveal, 1500 );
		void Promise.resolve( prepareContent( inner ) ).finally( reveal );
		return () => {
			active = false;
			window.clearTimeout( fallback );
		};
	}, [ html, prepareContent ] );

	return (
		<div
			ref={ frameRef }
			className={ className }
			style={ {
				aspectRatio: `${ size.width } / ${ size.height }`,
				overflow: 'hidden',
				position: 'relative',
			} }
			aria-label={ ariaLabel ?? size.label }
		>
			<div
				ref={ innerRef }
				style={ {
					position: 'absolute',
					top: 0,
					left: 0,
					width: size.width,
					height: size.height,
					transform: `scale(${ scale })`,
					transformOrigin: 'top left',
					transition: 'opacity 140ms ease',
				} }
				dangerouslySetInnerHTML={ { __html: html } }
			/>
		</div>
	);
}
