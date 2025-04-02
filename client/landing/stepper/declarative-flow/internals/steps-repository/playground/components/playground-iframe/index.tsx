import { useEffect, useRef } from 'react';
import { usePhpVersions } from 'calypso/data/php-versions/use-php-versions';
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
	const recommendedPHPVersion = usePhpVersions().recommendedValue;

	useEffect( () => {
		if ( ! iframeRef.current ) {
			return;
		}

		if ( playgroundClient ) {
			return;
		}

		initializeWordPressPlayground( iframeRef.current, recommendedPHPVersion ).then(
			( playgroundClient ) => {
				setPlaygroundClient( playgroundClient );
			}
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<iframe ref={ iframeRef } id="wp" title="WordPress Playground" className={ className }></iframe>
	);
}
