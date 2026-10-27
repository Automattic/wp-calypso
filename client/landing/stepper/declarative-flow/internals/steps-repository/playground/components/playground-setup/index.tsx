import { ProgressBar } from '@automattic/components';
import { Progress, SubTitle, Title } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useRef, useEffect, useState } from 'react';
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

type ImportFailureReason =
	| 'timeout'
	| 'unsupported_file_type'
	| 'playground_not_found'
	| 'import_failure'
	| 'blueprint_import_failure';

const RETRYABLE_REASONS: ImportFailureReason[] = [ 'import_failure', 'blueprint_import_failure' ];

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
	const { siteId, siteSlug } = useSiteData();
	const [ query ] = useSearchParams();
	const { mutateAsync: importBlueprint } = useImportBlueprint();

	const [ progress, setProgress ] = useState< PlaygroundImportProgress | null >( null );
	const [ failureReason, setFailureReason ] = useState< ImportFailureReason | null >( null );
	const keepOpenSubtitle = __(
		'This usually takes a few minutes. Keep this window open until your site is ready.'
	);

	// navigation.submit is recreated on every flow render. Reading it through a
	// ref keeps it out of effect deps, so a pending import is not started again.
	const submitRef = useRef( submit );
	submitRef.current = submit;

	const startBlueprintImport = useCallback(
		async ( blueprint: string ) => {
			setFailureReason( null );
			try {
				await importBlueprint( { blueprint, siteId } );
			} catch ( error ) {
				recordTracksEvent( 'calypso_playground_blueprint_import_failed', {
					site_id: siteId,
					blueprint,
					error_message: error instanceof Error ? error.message : String( error ),
				} );
				setFailureReason( 'blueprint_import_failure' );
				return;
			}
			submitRef.current?.( { siteSlug, siteId } );
		},
		[ importBlueprint, siteId, siteSlug ]
	);

	useEffect( () => {
		const blueprint = query.get( 'blueprint' );
		if ( ! blueprint || ! siteId ) {
			return;
		}
		startBlueprintImport( blueprint );
	}, [ query, siteId, startBlueprintImport ] );

	const startImport = async ( client: PlaygroundClient, { isNewPlayground = false } = {} ) => {
		if ( ! client ) {
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

		// The saved Playground can be gone from this browser, in which case the
		// iframe boots a blank site and there is nothing to import.
		const playgroundSlug = query.get( 'playground' );
		if ( isNewPlayground || ! playgroundSlug ) {
			recordTracksEvent( `${ eventPrefix }_failed`, {
				site_id: siteId,
				reason: 'playground_not_found',
			} );
			setFailureReason( 'playground_not_found' );
			return;
		}

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
		submitRef.current?.( { siteSlug, siteId } );
	};

	const retryImport = () => {
		const blueprint = query.get( 'blueprint' );
		if ( blueprint ) {
			startBlueprintImport( blueprint );
			return;
		}
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
		playground_not_found: __(
			'Your Playground site could not be found in this browser, so there is nothing to import.'
		),
		import_failure: __(
			'Something went wrong while importing your Playground site. Please try again.'
		),
		blueprint_import_failure: __(
			'Something went wrong while setting up your site. Please try again.'
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
							{ RETRYABLE_REASONS.includes( failureReason ) && (
								<Button variant="primary" onClick={ retryImport }>
									{ __( 'Try again' ) }
								</Button>
							) }
							<Button
								variant={ RETRYABLE_REASONS.includes( failureReason ) ? 'secondary' : 'primary' }
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
