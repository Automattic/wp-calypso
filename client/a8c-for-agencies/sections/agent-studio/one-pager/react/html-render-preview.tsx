import clsx from 'clsx';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { prepareElaRenderElement } from '../engine/render-png';
import { ELA_PAGE_HEIGHT, ELA_PAGE_WIDTH } from '../engine/types';

import './html-render-preview.scss';

interface Props {
	html: string;
	className?: string;
	innerClassName?: string;
	ariaLabel?: string;
	/**
	 * Bump this to force a re-fit without changing `html`. Used when the
	 * viewer switches between single and facing layouts so the page reflows
	 * against its new column width.
	 */
	refitToken?: unknown;
}

/**
 * Mounts an Ela page HTML string and scales it to fit its container width
 * via ResizeObserver. Runs the engine's fit pipeline so the on-screen preview
 * matches the exported PNG, and hides the unfitted draft until the pipeline
 * settles so cover swaps don't flash a misaligned page.
 */
export default function HtmlRenderPreview( {
	html,
	className,
	innerClassName,
	ariaLabel,
	refitToken,
}: Props ) {
	const frameRef = useRef< HTMLDivElement >( null );
	const innerRef = useRef< HTMLDivElement >( null );
	const [ scale, setScale ] = useState( 1 );

	useEffect( () => {
		const frame = frameRef.current;
		if ( ! frame ) {
			return;
		}
		const updateScale = () => {
			const next = frame.clientWidth / ELA_PAGE_WIDTH;
			if ( Number.isFinite( next ) && next > 0 ) {
				setScale( next );
			}
		};
		updateScale();
		const observer = new ResizeObserver( updateScale );
		observer.observe( frame );
		return () => observer.disconnect();
	}, [] );

	// Layout effect so the markup reset + hide land before the browser paints,
	// otherwise the raw unfitted page flashes for one frame on every cover swap.
	useLayoutEffect( () => {
		const inner = innerRef.current;
		if ( ! inner ) {
			return;
		}
		// Reset to the unfitted markup before fitting. React's
		// dangerouslySetInnerHTML only re-applies when `html` changes, so on a
		// refitToken bump the DOM still holds the previous (mutated) fit — start
		// fresh so the fit measures original sizes, not already-shrunk ones.
		inner.innerHTML = html;
		let active = true;
		inner.style.opacity = '0';
		const reveal = () => {
			if ( active ) {
				inner.style.opacity = '1';
			}
		};
		// Safety net so a stuck font/image wait never leaves the page hidden.
		const fallback = window.setTimeout( reveal, 1500 );
		void Promise.resolve( prepareElaRenderElement( inner ) ).finally( reveal );
		return () => {
			active = false;
			window.clearTimeout( fallback );
		};
	}, [ html, refitToken ] );

	return (
		<div
			ref={ frameRef }
			className={ clsx( 'a4a-one-pager-preview', className ) }
			style={ { aspectRatio: `${ ELA_PAGE_WIDTH } / ${ ELA_PAGE_HEIGHT }` } }
			aria-label={ ariaLabel }
		>
			<div
				ref={ innerRef }
				className={ clsx( 'a4a-one-pager-preview__inner', innerClassName ) }
				style={ {
					width: `${ ELA_PAGE_WIDTH }px`,
					height: `${ ELA_PAGE_HEIGHT }px`,
					transform: `scale(${ scale })`,
				} }
			/>
		</div>
	);
}
