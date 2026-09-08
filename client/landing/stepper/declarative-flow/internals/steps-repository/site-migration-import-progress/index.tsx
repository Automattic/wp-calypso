import {
	isStaticSiteImportPlanHashMismatch,
	STATIC_SITE_IMPORT_TERMINAL_STATES,
} from '@automattic/api-core';
import {
	approveStaticSiteImportSessionMutation,
	attachSwitchRunMutation,
	staticSiteImportSessionQuery,
} from '@automattic/api-queries';
import { Step } from '@automattic/onboarding';
import { useMutation, useQuery as useReactQuery } from '@tanstack/react-query';
import { ProgressBar } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { useFlowState } from '../../state-manager/store';
import type { Step as StepType } from '../../types';
import type { StaticSiteImportState } from '@automattic/api-core';

import './style.scss';

const POLL_INTERVAL = 5000;

const SLUG = 'site-migration-import-progress';

export type SiteMigrationImportProgressSubmits = {
	sessionId: string;
	planHash?: string;
	state?: StaticSiteImportState;
};

type FailureReason = 'attach' | 'stale-preview' | 'import' | 'missing';

const SiteMigrationImportProgress: StepType< {
	submits: SiteMigrationImportProgressSubmits;
} > = ( { navigation } ) => {
	const { __ } = useI18n();
	const { siteId } = useSiteData();
	const { get, set } = useFlowState();
	const [ searchParams, setSearchParams ] = useSearchParams();

	const persisted = get( SLUG );

	const runId = searchParams.get( 'switchRunId' ) ?? get( 'site-migration-scan' )?.runId ?? '';
	const sessionId = searchParams.get( 'sessionId' ) ?? persisted?.sessionId ?? '';

	/**
	 * The plan hash the user actually reviewed. Approval is hash-bound, so without
	 * one there is nothing to approve against and this step must stay passive —
	 * landing here directly never applies an import on the user's behalf.
	 */
	const reviewedPlanHash = searchParams.get( 'planHash' ) ?? persisted?.planHash ?? '';

	const [ failure, setFailure ] = useState< FailureReason | null >( null );

	const remember = useCallback(
		( next: { sessionId?: string; planHash?: string } ) => {
			const merged = {
				sessionId: next.sessionId ?? sessionId,
				planHash: next.planHash ?? reviewedPlanHash,
			};

			set( SLUG, merged );

			const params = new URLSearchParams( searchParams );
			params.set( 'sessionId', merged.sessionId );
			if ( merged.planHash ) {
				params.set( 'planHash', merged.planHash );
			}
			setSearchParams( params, { replace: true } );
		},
		[ reviewedPlanHash, searchParams, sessionId, set, setSearchParams ]
	);

	const { mutate: attach } = useMutation( attachSwitchRunMutation() );
	const attachRequested = useRef( false );

	useEffect( () => {
		if ( sessionId || ! runId || ! siteId || attachRequested.current ) {
			return;
		}

		attachRequested.current = true;
		attach(
			{ runId, destinationBlogId: siteId },
			{
				onSuccess: ( run ) => {
					if ( run.session_id ) {
						remember( { sessionId: run.session_id } );
					} else {
						setFailure( 'attach' );
					}
				},
				onError: () => setFailure( 'attach' ),
			}
		);
	}, [ attach, remember, runId, sessionId, siteId ] );

	const { data: session, isError: isSessionError } = useReactQuery( {
		...staticSiteImportSessionQuery( siteId, sessionId ),
		enabled: Boolean( siteId && sessionId ),
		refetchInterval: ( query ) => {
			const state = query.state.data?.state;
			return state && STATIC_SITE_IMPORT_TERMINAL_STATES.includes( state ) ? false : POLL_INTERVAL;
		},
	} );

	const { mutate: approve } = useMutation( approveStaticSiteImportSessionMutation() );
	const approveRequested = useRef( false );

	useEffect( () => {
		if (
			approveRequested.current ||
			! siteId ||
			! session ||
			session.state !== 'preview_ready' ||
			! session.plan_hash ||
			! reviewedPlanHash ||
			session.plan_hash !== reviewedPlanHash
		) {
			return;
		}

		approveRequested.current = true;
		approve(
			{ siteId, sessionId: session.session_id, planHash: session.plan_hash },
			{
				onError: ( error ) =>
					setFailure( isStaticSiteImportPlanHashMismatch( error ) ? 'stale-preview' : 'import' ),
			}
		);
	}, [ approve, reviewedPlanHash, session, siteId ] );

	const submitted = useRef( false );

	useEffect( () => {
		if ( submitted.current || session?.state !== 'finished' ) {
			return;
		}

		submitted.current = true;
		navigation.submit( {
			sessionId: session.session_id,
			planHash: reviewedPlanHash || undefined,
			state: 'finished',
		} );
	}, [ navigation, reviewedPlanHash, session ] );

	const state = session?.state;
	const failureReason: FailureReason | null =
		failure ?? ( ! sessionId && ! runId ? 'missing' : null );
	const needsConfirmation =
		! failureReason &&
		state === 'preview_ready' &&
		Boolean( session?.plan_hash ) &&
		! reviewedPlanHash;

	const failureCopy: Record< FailureReason, string > = {
		attach: __( 'We couldn’t connect this import to your site.' ),
		'stale-preview': __( 'This preview is out of date, so we stopped before changing anything.' ),
		import: __( 'Something went wrong and your site wasn’t changed.' ),
		missing: __( 'We couldn’t find a migration to continue.' ),
	};

	let heading: string = __( 'Building your site' );
	let body: string = __( 'This can take a few minutes. You can safely leave this page open.' );
	let showProgress = true;

	if ( failureReason ) {
		heading = __( 'We couldn’t finish your migration' );
		body = failureCopy[ failureReason ];
		showProgress = false;
	} else if ( isSessionError ) {
		heading = __( 'We couldn’t check on your migration' );
		body = __( 'Refresh the page to try again.' );
		showProgress = false;
	} else if ( state === 'failed' ) {
		heading = __( 'We couldn’t finish your migration' );
		body = __( 'Something went wrong and your site wasn’t changed.' );
		showProgress = false;
	} else if ( state === 'finished' ) {
		heading = __( 'Your site is ready' );
		body = __( 'Taking you to your new site.' );
	} else if ( needsConfirmation ) {
		heading = __( 'Ready to move your site' );
		body = __( 'Nothing has changed yet. Start the import when you’re ready.' );
		showProgress = false;
	} else if ( state === 'applying' ) {
		body = __( 'We’re moving your content across now.' );
	} else if ( state === 'queued' ) {
		body = __( 'Your migration is queued and will start shortly.' );
	} else if ( state === 'preview_ready' ) {
		body = __( 'Starting your migration.' );
	} else if ( state ) {
		heading = __( 'Reading your site' );
		body = __( 'We’re collecting your pages, posts, and images.' );
	} else {
		heading = __( 'Getting things ready' );
		body = __( 'Hold tight while we set up your migration.' );
	}

	return (
		<>
			<DocumentHead title={ heading } />
			<Step.CenteredColumnLayout
				className="step-container-v2--site-migration-import-progress"
				columnWidth={ 6 }
				topBar={ <Step.TopBar /> }
				heading={ <Step.Heading text={ heading } subText={ body } /> }
			>
				<div className="site-migration-import-progress" data-testid="import-progress">
					{ showProgress && <ProgressBar /> }
					{ needsConfirmation && (
						<Step.PrimaryButton
							onClick={ () => remember( { planHash: session?.plan_hash } ) }
							disabled={ ! session?.plan_hash }
						>
							{ __( 'Start the import' ) }
						</Step.PrimaryButton>
					) }
				</div>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationImportProgress;
