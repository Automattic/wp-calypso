import { ProgressBar } from '@automattic/components';
import { Progress, SubTitle, Title } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useRef, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProgressScreen from 'calypso/blocks/importer/components/progress-screen';
import DocumentHead from 'calypso/components/data/document-head';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StepWrapper from 'calypso/signup/step-wrapper';
import {
	SESSION_KEY_FROM_PLAYGROUND_PUBLISH,
	SESSION_KEY_PLAYGROUND_WOO_INTENT,
} from '../../lib/constants';
import { useImportBlueprint } from '../../lib/import-blueprint';
import {
	importPlaygroundSite,
	removeSandboxPlugins,
	ImportTimeoutError,
} from '../../lib/import-playground';
import { PlaygroundIframe } from '../playground-iframe';
import type { Step } from '../../../../types';
import type { PlaygroundImportProgress } from '../../lib/import-playground';
import type { PlaygroundClient } from '../../lib/types';
import './style.scss';

type ImportResult = { status: 'error'; reason: 'timeout' | 'import_failure' };

export const PlaygroundSetupStep: Step< {
	submits: {
		siteSlug?: string;
		siteId: number;
	};
} > = ( props ) => {
	const { submit } = props.navigation;
	const { __ } = useI18n();
	const playgroundClientRef = useRef< PlaygroundClient | null >( null );
	const { siteId, siteSlug } = useSiteData();
	const [ query ] = useSearchParams();
	const { mutateAsync: importBlueprint } = useImportBlueprint();

	const [ progress, setProgress ] = useState< PlaygroundImportProgress | null >( null );
	const [ result, setResult ] = useState< ImportResult | null >( null );
	const keepOpenSubtitle = __(
		'This usually takes a few minutes. Keep this window open until your site is ready.'
	);

	useEffect( () => {
		// If blueprint exists, import it and then submit
		const blueprint = query.get( 'blueprint' );
		if ( blueprint && submit && siteId ) {
			const runBlueprintImport = async () => {
				try {
					await importBlueprint( { blueprint, siteId } );
					submit( {
						siteSlug,
						siteId,
					} );
				} catch ( error ) {
					// Add error handling
					// eslint-disable-next-line no-console
					console.error( error );
				}
			};
			runBlueprintImport();
		}
	}, [ query, submit, siteSlug, siteId, importBlueprint ] );

	const startImport = async ( client: PlaygroundClient ) => {
		if ( ! client || ! submit ) {
			return;
		}

		const playgroundSlug = query.get( 'playground' );
		if ( ! playgroundSlug ) {
			return;
		}

		playgroundClientRef.current = client;
		setResult( null );
		setProgress( null );

		// The Playground publish flow (entrepreneur) exports a WooCommerce sandbox
		// that carries sandbox-only plugins, and leaves through its own submit
		// redirect once the import finishes.
		const isPublishFlow = sessionStorage.getItem( SESSION_KEY_FROM_PLAYGROUND_PUBLISH ) === '1';
		const eventPrefix = isPublishFlow
			? 'calypso_playground_woo_import'
			: 'calypso_playground_import';
		const importStartedAt = Date.now();
		const durationSeconds = () => Math.round( ( Date.now() - importStartedAt ) / 1000 );

		recordTracksEvent( `${ eventPrefix }_started`, { site_id: siteId } );
		try {
			if ( isPublishFlow ) {
				await removeSandboxPlugins( client );
			}
			await importPlaygroundSite( playgroundSlug, siteId, setProgress );
		} catch ( error ) {
			const reason = error instanceof ImportTimeoutError ? 'timeout' : 'import_failure';
			recordTracksEvent( `${ eventPrefix }_failed`, {
				site_id: siteId,
				reason,
				duration_seconds: durationSeconds(),
			} );
			setResult( { status: 'error', reason } );
			return;
		}

		recordTracksEvent( `${ eventPrefix }_succeeded`, {
			site_id: siteId,
			duration_seconds: durationSeconds(),
		} );

		if ( isPublishFlow ) {
			submit( { siteSlug, siteId } );
			return;
		}

		// The site is what the user launched, so show it as soon as it is live.
		window.location.assign( siteSlug ? `https://${ siteSlug }` : `/home/${ siteId }` );
	};

	const retryImport = () => {
		if ( playgroundClientRef.current ) {
			startImport( playgroundClientRef.current );
		}
	};

	const renderProgress = ( title: string, bar: { value: number; isPulsing?: boolean } ) => (
		<div className="import-layout__center">
			<Progress>
				<div className="import__heading import__heading-center">
					<Title>{ title }...</Title>
					<ProgressBar
						key={ progress?.phase ?? 'loading' }
						compact
						value={ bar.value }
						isPulsing={ bar.isPulsing }
					/>
					<SubTitle>{ keepOpenSubtitle }</SubTitle>
				</div>
			</Progress>
		</div>
	);

	const getStatus = () => {
		if ( result?.status === 'error' ) {
			return (
				<div className="import-layout__center">
					<div className="import__heading import__heading-center">
						<Title>{ __( 'Your site could not be imported' ) }</Title>
						<SubTitle>
							{ result.reason === 'timeout'
								? __(
										'The import is taking longer than expected and may still finish. Check your dashboard in a few minutes, or try again.'
									)
								: __(
										'Something went wrong while importing your Playground site. Please try again.'
									) }
						</SubTitle>
						<div className="playground-setup__actions">
							<Button variant="primary" onClick={ retryImport }>
								{ __( 'Try again' ) }
							</Button>
							<Button variant="secondary" href={ `/home/${ siteSlug }` }>
								{ __( 'Go to dashboard' ) }
							</Button>
						</div>
					</div>
				</div>
			);
		}

		if ( progress?.phase === 'importing' ) {
			return <ProgressScreen job={ progress.job } showHeading subtitle={ keepOpenSubtitle } />;
		}

		if ( progress?.phase === 'starting' ) {
			return renderProgress( __( 'Starting the import' ), { value: 100, isPulsing: true } );
		}

		if ( progress?.phase === 'uploading' ) {
			return progress.percent === undefined
				? renderProgress( __( 'Uploading to WordPress.com' ), { value: 100, isPulsing: true } )
				: renderProgress( __( 'Uploading to WordPress.com' ), { value: progress.percent } );
		}

		if ( progress?.phase === 'packing' ) {
			const isStore =
				sessionStorage.getItem( SESSION_KEY_PLAYGROUND_WOO_INTENT ) === '1' ||
				sessionStorage.getItem( SESSION_KEY_FROM_PLAYGROUND_PUBLISH ) === '1';

			return renderProgress(
				isStore ? __( 'Packing up your store' ) : __( 'Packing up your site' ),
				{ value: 100, isPulsing: true }
			);
		}

		return renderProgress( __( 'Loading your Playground site' ), { value: 100, isPulsing: true } );
	};

	const getStepContent = () => {
		const hasBlueprint = query.get( 'blueprint' );

		return (
			<>
				{ getStatus() }
				{ ! hasBlueprint && (
					<PlaygroundIframe
						className="playground__onboarding-iframe"
						hasPlaygroundClient={ Boolean( playgroundClientRef.current ) }
						setPlaygroundClient={ startImport }
					/>
				) }
			</>
		);
	};

	return (
		<>
			<DocumentHead title={ __( 'Playground Setup' ) } />
			<StepWrapper hideBack hideSkip stepContent={ getStepContent() } />
		</>
	);
};

export default PlaygroundSetupStep;
