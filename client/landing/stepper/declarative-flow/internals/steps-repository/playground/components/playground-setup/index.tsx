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
import { SESSION_KEY_FROM_PLAYGROUND_PUBLISH } from '../../lib/constants';
import { useImportBlueprint } from '../../lib/import-blueprint';
import {
	importPlaygroundSite,
	removeSandboxPlugins,
	ImportTimeoutError,
	UnsupportedExportError,
} from '../../lib/import-playground';
import { PlaygroundIframe } from '../playground-iframe';
import type { Step } from '../../../../types';
import type { PlaygroundImportProgress } from '../../lib/import-playground';
import type { PlaygroundClient } from '../../lib/types';
import './style.scss';

type ImportFailureReason = 'timeout' | 'unsupported_file_type' | 'import_failure';

function getFailureReason( error: unknown ): ImportFailureReason {
	if ( error instanceof ImportTimeoutError ) {
		return 'timeout';
	}
	if ( error instanceof UnsupportedExportError ) {
		return 'unsupported_file_type';
	}
	return 'import_failure';
}

export const PlaygroundSetupStep: Step< {
	submits: {
		siteSlug?: string;
		siteId: number;
	};
} > = ( props ) => {
	const { submit } = props.navigation;
	const { __ } = useI18n();
	const playgroundClientRef = useRef< PlaygroundClient | null >( null );
	const blueprintImportStartedForSiteRef = useRef< number | null >( null );
	const { siteId, siteSlug } = useSiteData();
	const [ query ] = useSearchParams();
	const { mutateAsync: importBlueprint } = useImportBlueprint();

	const [ progress, setProgress ] = useState< PlaygroundImportProgress | null >( null );
	const [ failureReason, setFailureReason ] = useState< ImportFailureReason | null >( null );
	const keepOpenSubtitle = __(
		'This usually takes a few minutes. Keep this window open until your site is ready.'
	);

	useEffect( () => {
		// If blueprint exists, import it and then submit
		const blueprint = query.get( 'blueprint' );
		if ( blueprint && submit && siteId ) {
			// Start the import at most once per site. This effect's deps (`query`,
			// `submit`) get new identities across renders, and dev hot-reloads re-run
			// it — a second POST while the first import is still in flight is rejected
			// with a 409 "Simultaneous imports are not permitted", which left the flow
			// stuck because the losing call never reaches submit().
			if ( blueprintImportStartedForSiteRef.current === siteId ) {
				return;
			}
			blueprintImportStartedForSiteRef.current = siteId;

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
		setFailureReason( null );
		setProgress( null );

		// The Playground publish flow (entrepreneur) exports a WooCommerce sandbox
		// that carries sandbox-only plugins.
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
			const reason = getFailureReason( error );
			recordTracksEvent( `${ eventPrefix }_failed`, {
				site_id: siteId,
				reason,
				duration_seconds: durationSeconds(),
			} );
			setFailureReason( reason );
			return;
		}

		recordTracksEvent( `${ eventPrefix }_succeeded`, {
			site_id: siteId,
			duration_seconds: durationSeconds(),
		} );

		// Each flow owns where the user goes once the site is ready.
		submit( { siteSlug, siteId } );
	};

	const retryImport = () => {
		if ( playgroundClientRef.current ) {
			startImport( playgroundClientRef.current );
		}
	};

	// Without a percentage, the bar pulses.
	const renderProgress = ( title: string, percent?: number ) => (
		<div className="import-layout__center">
			<Progress>
				<div className="import__heading import__heading-center">
					<Title>{ title }...</Title>
					<ProgressBar
						key={ progress?.phase ?? 'loading' }
						compact
						value={ percent ?? 100 }
						isPulsing={ percent === undefined }
					/>
					<SubTitle>{ keepOpenSubtitle }</SubTitle>
				</div>
			</Progress>
		</div>
	);

	const failureMessages: Record< ImportFailureReason, string > = {
		timeout: __(
			'The import is taking longer than expected and may still finish. Check your dashboard in a few minutes.'
		),
		unsupported_file_type: __(
			'WordPress.com did not recognize this Playground site as a site export, so it could not be imported.'
		),
		import_failure: __(
			'Something went wrong while importing your Playground site. Please try again.'
		),
	};

	const getStatus = () => {
		if ( failureReason ) {
			return (
				<div className="import-layout__center">
					<div className="import__heading import__heading-center">
						<Title>{ __( 'Your site could not be imported' ) }</Title>
						<SubTitle>{ failureMessages[ failureReason ] }</SubTitle>
						<div className="playground-setup__actions">
							{ failureReason === 'import_failure' && (
								<Button variant="primary" onClick={ retryImport }>
									{ __( 'Try again' ) }
								</Button>
							) }
							<Button
								variant={ failureReason === 'import_failure' ? 'secondary' : 'primary' }
								href={ `/home/${ siteSlug || siteId }` }
							>
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
			return renderProgress( __( 'Starting the import' ) );
		}

		if ( progress?.phase === 'uploading' ) {
			return renderProgress( __( 'Uploading to WordPress.com' ), progress.percent );
		}

		if ( progress?.phase === 'packing' ) {
			const isStore = sessionStorage.getItem( SESSION_KEY_FROM_PLAYGROUND_PUBLISH ) === '1';

			return renderProgress(
				isStore ? __( 'Packing up your store' ) : __( 'Packing up your site' )
			);
		}

		return renderProgress( __( 'Loading your Playground site' ) );
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
