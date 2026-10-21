import { speak } from '@wordpress/a11y';
import { ProgressBar } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPHPVersions } from 'calypso/data/php-versions';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { getBlueprintID } from '../../lib/blueprint';
import { BlueprintLoadError } from '../../lib/blueprint-load-error';
import { INITIAL_BOOT_PROGRESS } from '../../lib/boot-progress';
import { initializeWordPressPlayground } from '../../lib/initialize-playground';
import { PlaygroundError } from '../playground-error';
import { PlaygroundIntro } from '../playground-intro';
import type { PlaygroundBootProgress } from '../../lib/boot-progress';
import type { PlaygroundClient } from '../../lib/types';

import './style.scss';

export function PlaygroundIframe( {
	className,
	hasPlaygroundClient,
	setPlaygroundClient,
	showIntro = false,
}: {
	className?: string;
	hasPlaygroundClient: boolean;
	setPlaygroundClient: ( client: PlaygroundClient ) => void;
	// Covers the page with the Woo intro until the Playground is ready, instead of the loader.
	showIntro?: boolean;
} ) {
	const { __ } = useI18n();
	const iframeRef = useRef< HTMLIFrameElement >( null );
	const recommendedPHPVersion = getPHPVersions().recommendedValue;
	const [ searchParams, setSearchParams ] = useSearchParams();
	const [ playgroundError, setPlaygroundError ] = useState< Error | null >( null );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ bootProgress, setBootProgress ] = useState< PlaygroundBootProgress | null >(
		showIntro ? INITIAL_BOOT_PROGRESS : null
	);
	// Bumped whenever the user asks for another initialization; the effect below
	// must not re-run merely because an attempt failed, or a failing attempt that
	// leaves the URL unchanged would retry forever.
	const [ attempt, setAttempt ] = useState( 0 );
	const { setBlueprint } = useDispatch( ONBOARD_STORE );
	const [ query ] = useSearchParams();

	const retry = () => {
		// A failed dynamic import can remain cached for the lifetime of the document.
		window.location.reload();
	};

	const createNewPlayground = () => {
		searchParams.delete( 'playground' );
		if ( playgroundError instanceof BlueprintLoadError ) {
			searchParams.delete( 'blueprint' );
			searchParams.delete( 'blueprint-url' );
		}
		setSearchParams( searchParams, { replace: true } );
		setPlaygroundError( null );
		setAttempt( ( previous ) => previous + 1 );
	};

	useEffect( () => {
		if ( ! iframeRef.current ) {
			return;
		}

		if ( hasPlaygroundClient ) {
			return;
		}

		setIsLoading( true );
		setBootProgress( showIntro ? INITIAL_BOOT_PROGRESS : null );

		initializeWordPressPlayground(
			iframeRef.current,
			recommendedPHPVersion,
			setSearchParams,
			() => setIsLoading( false ),
			showIntro ? setBootProgress : undefined
		)
			.then( ( result ) => {
				setPlaygroundClient( result.client );
				if ( showIntro ) {
					setBootProgress( null );
					speak( __( 'Your store is ready.' ) );
				}

				const id = getBlueprintID( query );

				if ( id ) {
					// Save the Blueprint library ID to the store
					setBlueprint( { id } );
				}
			} )
			.catch( ( error ) => {
				setIsLoading( false );
				setBootProgress( null );
				setPlaygroundError( error instanceof Error ? error : new Error( String( error ) ) );
			} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ attempt, recommendedPHPVersion ] );

	if ( playgroundError ) {
		return (
			<PlaygroundError
				error={ playgroundError }
				createNewPlayground={ createNewPlayground }
				retry={ retry }
			/>
		);
	}

	return (
		<div className={ clsx( 'playground-iframe', className ) }>
			{ bootProgress && <PlaygroundIntro progress={ bootProgress } /> }
			{ isLoading && ! bootProgress && (
				<div className="playground-iframe__loading">
					<ProgressBar className="playground-iframe__progress-bar" />
				</div>
			) }
			<iframe
				ref={ iframeRef }
				id="wp"
				title="WordPress Playground"
				// Keeps focus out of the Playground while the intro covers it.
				inert={ Boolean( bootProgress ) }
			/>
		</div>
	);
}
