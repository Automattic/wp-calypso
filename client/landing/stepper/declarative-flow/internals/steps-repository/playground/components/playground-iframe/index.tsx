import { useDispatch } from '@wordpress/data';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { getPHPVersions } from 'calypso/data/php-versions';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { initializeWordPressPlayground } from '../../lib/initialize-playground';
import { PlaygroundError } from '../playground-error';
import type { PlaygroundClient } from '../../lib/types';

export function PlaygroundIframe( {
	className,
	playgroundClient,
	setPlaygroundClient,
}: {
	className?: string;
	playgroundClient: PlaygroundClient | null;
	setPlaygroundClient: ( client: PlaygroundClient ) => void;
} ) {
	const siteId = useSelector( getSelectedSiteId ) ?? 0;
	const iframeRef = useRef< HTMLIFrameElement >( null );
	const recommendedPHPVersion = getPHPVersions( siteId ).recommendedValue;
	const [ searchParams, setSearchParams ] = useSearchParams();
	const [ playgroundError, setPlaygroundError ] = useState< string | null >( null );
	const { setBlueprint } = useDispatch( ONBOARD_STORE );

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
			.then( ( result ) => {
				setPlaygroundClient( result.client );
				setBlueprint( result.blueprint );
			} )
			.catch( ( error ) => {
				if ( error.message === 'WordPress installation has failed.' ) {
					setPlaygroundError( 'PLAYGROUND_NOT_FOUND' );
				} else {
					setPlaygroundError( 'UNKNOWN_ERROR' );
				}
			} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ playgroundError, recommendedPHPVersion ] );

	if ( playgroundError === 'PLAYGROUND_NOT_FOUND' ) {
		return <PlaygroundError createNewPlayground={ createNewPlayground } />;
	}

	return (
		<iframe ref={ iframeRef } id="wp" title="WordPress Playground" className={ className }></iframe>
	);
}
