import { ProgressBar } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { getPHPVersions } from 'calypso/data/php-versions';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getBlueprintID } from '../../lib/blueprint';
import { initializeWordPressPlayground } from '../../lib/initialize-playground';
import { PlaygroundError } from '../playground-error';
import type { PlaygroundClient } from '../../lib/types';

import './style.scss';

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
	const [ isLoading, setIsLoading ] = useState( true );
	const { setBlueprint } = useDispatch( ONBOARD_STORE );
	const [ query ] = useSearchParams();

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

		setIsLoading( true );

		initializeWordPressPlayground( iframeRef.current, recommendedPHPVersion, setSearchParams, () =>
			setIsLoading( false )
		)
			.then( ( result ) => {
				setPlaygroundClient( result.client );

				const id = getBlueprintID( query );

				if ( id ) {
					// Save the Blueprint library ID to the store
					setBlueprint( { id } );
				}
			} )
			.catch( ( error ) => {
				setIsLoading( false );
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
		<div className={ clsx( 'playground-iframe', className ) }>
			{ isLoading && (
				<div className="playground-iframe__loading">
					<ProgressBar className="playground-iframe__progress-bar" />
				</div>
			) }
			<iframe ref={ iframeRef } id="wp" title="WordPress Playground" />
		</div>
	);
}
