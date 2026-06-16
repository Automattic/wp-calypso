import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import AsyncLoad from 'calypso/components/async-load';
import { QuickPostSkeleton } from './skeleton';

const loadQuickPost = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-components-quick-post" */ 'calypso/reader/components/quick-post'
	);

// The composer renders a Gutenberg block editor inside an `editor-canvas`
// iframe, which scrolls itself into view as it initializes — and because the
// composer sits at the very top of the stream, that scrolls the whole page to
// the top. When the stream remounts after a full post is closed, that scroll
// races the stream's scroll restoration and occasionally wins, dumping the
// reader back at the top of the feed (READ-133).
//
// Gate the iframe on visibility: it only mounts once its slot is on screen, so
// when the user has scrolled past it — the exact situation the bug happens in —
// the editor never mounts and never scrolls. We can't just read the scroll
// position at mount: the stream restores scroll on a deferred timeout (see
// `client/reader/stream/index.jsx`), so the page momentarily sits at the top
// before jumping to the saved position. Skipping the observer until that
// initial layout has settled keeps us from mounting the editor during that
// transient top position.
const SETTLE_DELAY_MS = 300;

export function LazyQuickPost(): JSX.Element {
	const [ hasSettled, setHasSettled ] = useState( false );
	const { ref, inView } = useInView( {
		triggerOnce: true,
		skip: ! hasSettled,
		rootMargin: '200px 0px',
	} );

	useEffect( () => {
		const timer = setTimeout( () => setHasSettled( true ), SETTLE_DELAY_MS );
		return () => clearTimeout( timer );
	}, [] );

	return (
		<div ref={ ref } className="quick-post-lazy">
			{ inView ? (
				<AsyncLoad require={ loadQuickPost } placeholder={ <QuickPostSkeleton /> } />
			) : (
				<QuickPostSkeleton />
			) }
		</div>
	);
}
