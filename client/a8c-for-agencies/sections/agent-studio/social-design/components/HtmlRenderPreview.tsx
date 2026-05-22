/* eslint-disable react/no-danger */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { OutputSize } from '../types';

type Props = {
	html: string;
	size: OutputSize;
	className?: string;
	innerClassName?: string;
	ariaLabel?: string;
	isolated?: boolean;
	prepareContent?: ( element: HTMLElement ) => void | Promise< void >;
	// Bump this to force a re-fit without changing `html`. The fit pipeline
	// mutates the DOM (inline font-size, wrapper spans) and is not idempotent,
	// so a re-fit resets the markup to `html` first. Used when the viewer
	// switches layout (single ↔ facing pages) and the fit must be recomputed.
	refitToken?: unknown;
};

export function HtmlRenderPreview( {
	html,
	size,
	className,
	innerClassName,
	ariaLabel,
	isolated = false,
	prepareContent,
	refitToken,
}: Props ) {
	const frameRef = useRef< HTMLDivElement >( null );
	const innerRef = useRef< HTMLDivElement >( null );
	const iframeRef = useRef< HTMLIFrameElement >( null );
	const [ fontCss, setFontCss ] = useState( '' );
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
		if ( isolated || ! inner || ! prepareContent ) {
			return;
		}
		// Reset to the unfitted markup before fitting. React's
		// dangerouslySetInnerHTML only re-applies when `html` changes, so on a
		// refitToken bump the DOM still holds the previous (mutated) fit — start
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
	}, [ html, isolated, prepareContent, refitToken ] );

	useEffect( () => {
		if ( ! isolated ) {
			return;
		}
		let cancelled = false;
		const collectFontCss = () => {
			const css = Array.from(
				document.querySelectorAll< HTMLStyleElement >(
					'style[data-pack-font], style[data-inlined-font]'
				)
			)
				.map( ( style ) => style.textContent ?? '' )
				.filter( Boolean )
				.join( '\n' );
			if ( ! cancelled ) {
				setFontCss( css );
			}
		};
		collectFontCss();
		const timers = [
			window.setTimeout( collectFontCss, 250 ),
			window.setTimeout( collectFontCss, 1000 ),
		];
		document.fonts?.ready.then( collectFontCss ).catch( () => undefined );
		return () => {
			cancelled = true;
			timers.forEach( ( timer ) => window.clearTimeout( timer ) );
		};
	}, [ isolated, html ] );

	const srcDoc = isolated
		? `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:${ size.width }px;height:${ size.height }px;overflow:hidden;background:transparent;}</style><style>${ fontCss }</style></head><body>${ html }</body></html>`
		: '';

	async function prepareIframeContent() {
		if ( ! isolated || ! prepareContent ) {
			return;
		}
		const body = iframeRef.current?.contentDocument?.body;
		if ( ! body ) {
			return;
		}
		await prepareContent( body );
	}

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
				className={ innerClassName }
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
				dangerouslySetInnerHTML={ isolated ? undefined : { __html: html } }
			>
				{ isolated ? (
					<iframe
						ref={ iframeRef }
						title={ ariaLabel ?? size.label }
						srcDoc={ srcDoc }
						onLoad={ () => {
							void prepareIframeContent();
						} }
						style={ {
							display: 'block',
							width: size.width,
							height: size.height,
							border: 0,
						} }
					/>
				) : null }
			</div>
		</div>
	);
}
