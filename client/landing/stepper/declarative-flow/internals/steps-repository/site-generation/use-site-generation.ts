import { useCallback, useEffect, useRef, useState } from 'react';
import { logBuildWowEvent, requestBuildWowSite } from 'calypso/landing/stepper/utils/build-wow';
import { pollForBuildWowStatus } from './build-status-poller';
import type { BuildWowUi } from './build-status-poller';

export type SiteGenerationStep = {
	id: string;
	label: string;
	status: 'pending' | 'active' | 'complete';
};

export type SiteGenerationFailureReason = 'missing-parameters' | 'timed-out' | 'build-failed';

export type SiteGenerationState = {
	status: 'working' | 'failed';
	failureReason?: SiteGenerationFailureReason;
	// Server-authored failure copy from the status endpoint's failed ui
	// block, rendered verbatim when present.
	failureLabel?: string;
	failureDetail?: string;
	steps: SiteGenerationStep[];
	// Re-queues the failed build in place. Non-null only when the server's
	// failed ui block says can_retry and the page knows the site and spec.
	retryBuild: ( () => void ) | null;
	isRetryingBuild: boolean;
};

const GENERATION_TIMEOUT_MS = 30 * 60 * 1000;

type GenerationFailure = { reason: 'timed-out' } | { reason: 'build-failed'; ui: BuildWowUi };

// The server computes the checklist (ui.steps) from the build's durable
// signals and localizes the labels; this maps its rows onto the view's step
// shape. Rows without an id or label are dropped rather than rendered empty.
function getStepsFromServer( ui: BuildWowUi ): SiteGenerationStep[] {
	return ( ui.steps ?? [] )
		.filter( ( step ) => step.id && step.label )
		.map( ( step ) => {
			let status: SiteGenerationStep[ 'status' ] = 'pending';
			if ( step.state === 'done' ) {
				status = 'complete';
			} else if ( step.state === 'active' ) {
				status = 'active';
			}
			return { id: step.id as string, label: step.label as string, status };
		} );
}

export function useSiteGeneration( {
	siteIdentifier,
	editorUrl,
	specId,
	steps,
}: {
	siteIdentifier: string | null;
	editorUrl: string | null;
	specId?: string | null;
	// Fallback checklist, shown until the first status response delivers the
	// server-computed ui.steps (and kept for backends without the ui block).
	steps: Array< Pick< SiteGenerationStep, 'id' | 'label' > >;
} ): SiteGenerationState {
	const [ serverSteps, setServerSteps ] = useState< SiteGenerationStep[] | null >( null );
	const [ failure, setFailure ] = useState< GenerationFailure | null >( null );
	const [ buildAttempt, setBuildAttempt ] = useState( 0 );
	const [ isRetryingBuild, setIsRetryingBuild ] = useState( false );
	const isRetryingRef = useRef( false );
	const hasRequiredParameters = Boolean( siteIdentifier && editorUrl );

	useEffect( () => {
		if ( ! siteIdentifier || ! editorUrl || failure ) {
			return;
		}

		const generationTimeout = window.setTimeout(
			// The deadline never overwrites a server verdict that landed in
			// the same tick.
			() => setFailure( ( previous ) => previous ?? { reason: 'timed-out' } ),
			GENERATION_TIMEOUT_MS
		);
		const stopStatusPolling = pollForBuildWowStatus( {
			siteIdentifier,
			onReady: () => window.location.assign( editorUrl ),
			// A failure carrying the server's ui block becomes the retryable
			// build-failed state; without it, the calm "your brief is saved,
			// check again" state is kept, exactly as before the ui block
			// existed.
			onFailed: ( status, ui ) => {
				logBuildWowEvent( 'site_generation_failed', {
					status,
					site_identifier: siteIdentifier,
				} );
				setFailure( ui ? { reason: 'build-failed', ui } : { reason: 'timed-out' } );
			},
			// The sidebar renders the server's checklist verbatim: the same poll
			// that decides readiness also carries the steps, so the two can never
			// contradict each other.
			onUpdate: ( ui ) => {
				const nextSteps = getStepsFromServer( ui );
				if ( nextSteps.length > 0 ) {
					setServerSteps( nextSteps );
				}
			},
			onRequestError: ( reason ) =>
				logBuildWowEvent( 'site_generation_status_request_failed', {
					site_identifier: siteIdentifier,
					error: reason,
				} ),
		} );

		return () => {
			window.clearTimeout( generationTimeout );
			stopStatusPolling();
		};
	}, [ buildAttempt, editorUrl, failure, siteIdentifier ] );

	const retryBuild = useCallback( async () => {
		if ( ! siteIdentifier || ! specId || isRetryingRef.current ) {
			return;
		}
		isRetryingRef.current = true;
		setIsRetryingBuild( true );
		logBuildWowEvent( 'site_generation_retry_requested', {
			site_identifier: siteIdentifier,
			spec_id: specId,
		} );
		try {
			await requestBuildWowSite( siteIdentifier, specId );
			setServerSteps( null );
			setFailure( null );
			setBuildAttempt( ( attempt ) => attempt + 1 );
		} catch ( error ) {
			logBuildWowEvent( 'site_generation_retry_failed', {
				site_identifier: siteIdentifier,
				spec_id: specId,
				error: error instanceof Error ? error.message : String( error ),
			} );
		} finally {
			isRetryingRef.current = false;
			setIsRetryingBuild( false );
		}
	}, [ siteIdentifier, specId ] );

	let failureReason: SiteGenerationFailureReason | undefined;
	if ( ! hasRequiredParameters ) {
		failureReason = 'missing-parameters';
	} else if ( failure ) {
		failureReason = failure.reason;
	}

	const failedUi = failure?.reason === 'build-failed' ? failure.ui : undefined;
	const canRetryBuild = Boolean( failedUi?.can_retry && siteIdentifier && specId );

	return {
		status: failureReason ? 'failed' : 'working',
		failureReason,
		failureLabel: failedUi?.label,
		failureDetail: failedUi?.detail,
		steps:
			serverSteps ??
			steps.map( ( step, index ) => ( {
				...step,
				status: index === 0 ? ( 'active' as const ) : ( 'pending' as const ),
			} ) ),
		retryBuild: canRetryBuild ? retryBuild : null,
		isRetryingBuild,
	};
}
