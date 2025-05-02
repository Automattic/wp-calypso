import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePhpVersions } from 'calypso/data/php-versions/use-php-versions';
import { initializeWordPressPlayground } from '../../lib/initialize-playground';
import { PlaygroundError } from '../playground-error';
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
	const [ searchParams, setSearchParams ] = useSearchParams();
	const [ playgroundError, setPlaygroundError ] = useState< string | null >( null );

	const createNewPlayground = () => {
		// Clear the 'playground' parameter from the URL
		searchParams.delete( 'playground' );
		setSearchParams( searchParams );
		setPlaygroundError( null ); // this will cause re-render of the component
	};

	useEffect( () => {
		if ( ! iframeRef.current ) {
			return;
		}

		if ( playgroundClient ) {
			return;
		}

		initializeWordPressPlayground( iframeRef.current, recommendedPHPVersion, setSearchParams )
			.then( ( client ) => {
				setPlaygroundClient( client );
			} )
			.catch( ( error ) => {
				if ( error.message === 'WordPress installation has failed.' ) {
					setPlaygroundError( 'PLAYGROUND_NOT_FOUND' );
				} else {
					setPlaygroundError( 'UNKNOWN_ERROR' );
				}
			} );
	}, [ playgroundError ] );

	if ( playgroundError === 'PLAYGROUND_NOT_FOUND' ) {
		return <PlaygroundError createNewPlayground={ createNewPlayground } />;
	}

	return (
		<iframe ref={ iframeRef } id="wp" title="WordPress Playground" className={ className }></iframe>
	);
}
