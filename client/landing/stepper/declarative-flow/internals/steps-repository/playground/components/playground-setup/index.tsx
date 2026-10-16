import { useI18n } from '@wordpress/react-i18n';
import { useRef, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProgressScreen from 'calypso/blocks/importer/components/progress-screen';
import DocumentHead from 'calypso/components/data/document-head';
import Loading from 'calypso/components/loading';
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
import type { ImportJob } from 'calypso/blocks/importer/types';
import './style.scss';

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
		if ( ! client ) {
			return;
		}

		if ( ! submit ) {
			return;
		}

		const playgroundSlug = query.get( 'playground' );
		if ( ! playgroundSlug ) {
			return;
		}

		// When launched from the Playground publish flow (entrepreneur) there is no
		// surrounding Redux importer machinery to handle the start trigger and
		// polling — so importPlaygroundSite must block until the import completes.
		const waitForCompletion = sessionStorage.getItem( SESSION_KEY_FROM_PLAYGROUND_PUBLISH ) === '1';

		if ( waitForCompletion ) {
			await removeSandboxPlugins( client );
			const importStartedAt = Date.now();
			recordTracksEvent( 'calypso_playground_woo_import_started', { site_id: siteId } );
			try {
				await importPlaygroundSite( playgroundSlug, siteId, {
					waitForCompletion: true,
					onProgress: setProgress,
				} );
				recordTracksEvent( 'calypso_playground_woo_import_succeeded', {
					site_id: siteId,
					duration_seconds: Math.round( ( Date.now() - importStartedAt ) / 1000 ),
				} );
			} catch ( error ) {
				recordTracksEvent( 'calypso_playground_woo_import_failed', {
					site_id: siteId,
					reason: error instanceof ImportTimeoutError ? 'timeout' : 'import_failure',
					duration_seconds: Math.round( ( Date.now() - importStartedAt ) / 1000 ),
				} );
				throw error;
			}
		} else {
			await importPlaygroundSite( playgroundSlug, siteId, {
				waitForCompletion: false,
				onProgress: setProgress,
			} );
		}

		submit( {
			siteSlug,
			siteId,
		} );
	};

	const getStatus = () => {
		if ( progress?.phase === 'importing' ) {
			return <ProgressScreen job={ progress.job as ImportJob } showHeading />;
		}

		if ( progress?.phase === 'uploading' ) {
			return <Loading title={ __( 'Uploading to WordPress.com' ) } progress={ progress.percent } />;
		}

		if ( progress?.phase === 'packing' ) {
			const isStore =
				sessionStorage.getItem( SESSION_KEY_PLAYGROUND_WOO_INTENT ) === '1' ||
				sessionStorage.getItem( SESSION_KEY_FROM_PLAYGROUND_PUBLISH ) === '1';

			return (
				<Loading title={ isStore ? __( 'Packing up your store' ) : __( 'Packing up your site' ) } />
			);
		}

		return <Loading title={ __( 'Preparing your site' ) } />;
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
