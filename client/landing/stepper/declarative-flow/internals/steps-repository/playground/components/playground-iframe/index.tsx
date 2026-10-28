import { speak } from '@wordpress/a11y';
import { ProgressBar } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPHPVersions } from 'calypso/data/php-versions';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getBlueprintID, getBlueprintLabelForTracking } from '../../lib/blueprint';
import { BlueprintLoadError } from '../../lib/blueprint-load-error';
import { INITIAL_BOOT_PROGRESS } from '../../lib/boot-progress';
import { PLAYGROUND_HOST } from '../../lib/constants';
import { initializeWordPressPlayground } from '../../lib/initialize-playground';
import { PlaygroundError } from '../playground-error';
import { PlaygroundIntro } from '../playground-intro';
import type { PlaygroundBootProgress } from '../../lib/boot-progress';
import type { PlaygroundClient } from '../../lib/types';

import './style.scss';

// A new boot of a blueprint from the URL; the default blueprint has no WooCommerce.
const isNewBlueprintBoot = ( params: URLSearchParams ) =>
	! params.has( 'playground' ) && ( params.has( 'blueprint' ) || params.has( 'blueprint-url' ) );

// WordPress runs in a frame nested inside the Playground iframe, so walk up from the sender.
const isWithinFrame = ( source: MessageEventSource | null, frame: Window | null | undefined ) => {
	if ( ! source || ! frame || ! ( 'parent' in source ) ) {
		return false;
	}

	// `parent` is null once a frame is removed, and the top window is its own parent.
	for (
		let current: Window | null = source;
		current;
		current = current.parent === current ? null : current.parent
	) {
		if ( current === frame ) {
			return true;
		}
	}
	return false;
};

export function PlaygroundIframe( {
	className,
	hasPlaygroundClient,
	setPlaygroundClient,
	withIntro = false,
	onIntroChange,
	onPlaygroundMessage,
}: {
	className?: string;
	hasPlaygroundClient: boolean;
	setPlaygroundClient: ( client: PlaygroundClient ) => void;
	// Covers the page with the Woo intro, instead of the loader, while a new Playground boots.
	withIntro?: boolean;
	onIntroChange?: ( isShown: boolean ) => void;
	// Receives the data of each message posted from inside this Playground.
	onPlaygroundMessage?: ( data: unknown ) => void;
} ) {
	const { __ } = useI18n();
	const iframeRef = useRef< HTMLIFrameElement >( null );
	const recommendedPHPVersion = getPHPVersions().recommendedValue;
	const [ searchParams, setSearchParams ] = useSearchParams();
	const [ playgroundError, setPlaygroundError ] = useState< Error | null >( null );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ bootProgress, setBootProgress ] = useState< PlaygroundBootProgress | null >( () =>
		withIntro && isNewBlueprintBoot( searchParams ) ? INITIAL_BOOT_PROGRESS : null
	);
	// Bumped whenever the user asks for another initialization; the effect below
	// must not re-run merely because an attempt failed, or a failing attempt that
	// leaves the URL unchanged would retry forever.
	const [ attempt, setAttempt ] = useState( 0 );
	const { setBlueprint } = useDispatch( ONBOARD_STORE );
	const [ query ] = useSearchParams();
	const isIntroShown = Boolean( bootProgress );

	useEffect( () => {
		onIntroChange?.( isIntroShown );
	}, [ isIntroShown, onIntroChange ] );

	// Read through a ref, so a new callback doesn't re-register the window listener.
	const onPlaygroundMessageRef = useRef( onPlaygroundMessage );
	useEffect( () => {
		onPlaygroundMessageRef.current = onPlaygroundMessage;
	} );

	const hasMessageListener = Boolean( onPlaygroundMessage );
	useEffect( () => {
		if ( ! hasMessageListener ) {
			return;
		}

		const handleMessage = ( event: MessageEvent ) => {
			if (
				event.origin === PLAYGROUND_HOST &&
				isWithinFrame( event.source, iframeRef.current?.contentWindow )
			) {
				onPlaygroundMessageRef.current?.( event.data );
			}
		};
		window.addEventListener( 'message', handleMessage );
		return () => window.removeEventListener( 'message', handleMessage );
	}, [ hasMessageListener ] );

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

		// Decided per attempt, as "Start a new playground" changes the URL.
		const showIntro = withIntro && isNewBlueprintBoot( searchParams );
		const blueprint = getBlueprintLabelForTracking( searchParams );
		const introShownAt = Date.now();
		const durationSeconds = () => Math.round( ( Date.now() - introShownAt ) / 1000 );
		setIsLoading( true );
		setBootProgress( showIntro ? INITIAL_BOOT_PROGRESS : null );
		if ( showIntro ) {
			recordTracksEvent( 'calypso_playground_woo_intro_show', { blueprint } );
		}

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
					recordTracksEvent( 'calypso_playground_woo_intro_ready', {
						blueprint,
						duration_seconds: durationSeconds(),
					} );
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
				if ( showIntro ) {
					recordTracksEvent( 'calypso_playground_woo_intro_failed', {
						blueprint,
						reason: error instanceof BlueprintLoadError ? 'blueprint_load' : 'boot',
						duration_seconds: durationSeconds(),
					} );
				}
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
				inert={ isIntroShown }
			/>
		</div>
	);
}
