import { useEffect, useRef } from 'react';
import { initializeWordPressPlayground } from '../../lib/initialize-playground';
import type { PlaygroundClient } from '@wp-playground/client';
export function PlaygroundIframe( {
	className,
	playgroundClient,
	setPlaygroundClient,
}: {
	className?: string;
	playgroundClient: PlaygroundClient | null;
	setPlaygroundClient: ( client: PlaygroundClient ) => void;
} ) {
	const iframeRef = useRef< HTMLIFrameElement >( null );

	useEffect( () => {
		if ( ! iframeRef.current ) {
			return;
		}

		if ( playgroundClient ) {
			return;
		}

		initializeWordPressPlayground( iframeRef.current ).then( ( playgroundClient ) => {
			setPlaygroundClient( playgroundClient );
		} );
	}, [] );

	return (
		<iframe ref={ iframeRef } id="wp" title="WordPress Playground" className={ className }></iframe>
	);
}
