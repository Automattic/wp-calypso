import { useEffect, useRef, useState } from 'react';
import type { ThumbnailFrame } from '../../data/build-thumbnail-frames';

interface Props {
	frame: ThumbnailFrame;
	title: string;
}

/**
 * Renders one thumbnail frame in a sandboxed iframe scaled to its container.
 *
 * A frame is either a cross-origin `src` (the one-pager's signed filmstrip
 * URL) or a same-origin `srcDoc` (the client-composed social tile). Either way
 * `sandbox="allow-scripts"` WITHOUT `allow-same-origin` runs the document's
 * scripts (the page's `fit.js`) in an opaque origin, so they can't reach the
 * parent window or the session token. The iframe is laid out at its natural
 * canvas size and shrunk with a CSS transform; the container clips the overflow.
 */
export default function DeliverableThumbnailFrame( { frame, title }: Props ) {
	const wrapRef = useRef< HTMLDivElement >( null );
	const [ scale, setScale ] = useState( 0 );

	useEffect( () => {
		const wrap = wrapRef.current;
		if ( ! wrap ) {
			return;
		}
		// Scale to the band height so each page shows in full; its natural
		// width then determines how many fit before the row clips.
		const update = () => {
			const height = wrap.clientHeight;
			if ( height > 0 ) {
				setScale( height / frame.height );
			}
		};
		update();
		const observer = new ResizeObserver( update );
		observer.observe( wrap );
		return () => observer.disconnect();
	}, [ frame.height ] );

	return (
		<div
			ref={ wrapRef }
			className="a4a-agent-studio-deliverable-card__frame"
			role="img"
			aria-label={ title }
			style={ { aspectRatio: `${ frame.width } / ${ frame.height }` } }
		>
			<iframe
				title={ title }
				src={ frame.src }
				srcDoc={ frame.srcDoc }
				sandbox="allow-scripts"
				scrolling="no"
				tabIndex={ -1 }
				style={ {
					width: frame.width,
					height: frame.height,
					border: 0,
					transform: `scale(${ scale })`,
					transformOrigin: 'top left',
				} }
			/>
		</div>
	);
}
