import { useCallback, useEffect, useRef, useState } from 'react';
import { logBuildWowEvent, requestBuildWowSite } from 'calypso/landing/stepper/utils/build-wow';
import { pollForBuildWowStatus } from './build-status-poller';
import type { BuildWowUi } from './build-status-poller';
import type { BuildWowGraph } from 'calypso/landing/stepper/utils/build-wow';

export type SiteGenerationStep = {
	id: string;
	label: string;
	status: 'idle' | 'active' | 'done';
	startedAt?: number;
};

export type SiteGenerationFailureReason = 'missing-parameters' | 'timed-out' | 'build-failed';

export type SiteGenerationState = {
	status: 'working' | 'failed';
	failureReason?: SiteGenerationFailureReason;
	failureLabel?: string;
	failureDetail?: string;
	steps: SiteGenerationStep[];
	retryBuild: ( () => void ) | null;
	isRetryingBuild: boolean;
};

const GENERATION_TIMEOUT_MS = 30 * 60 * 1000;

type GenerationFailure = { reason: 'timed-out' } | { reason: 'build-failed'; ui: BuildWowUi };

function getStepsFromServer(
	ui: BuildWowUi,
	previousSteps: SiteGenerationStep[] | null
): SiteGenerationStep[] {
	const now = Date.now();

	return ( ui.steps ?? [] )
		.filter( ( step ) => step.id && step.label )
		.map( ( step ) => {
			let status: SiteGenerationStep[ 'status' ] = 'idle';
			if ( step.state === 'done' ) {
				status = 'done';
			} else if ( step.state === 'active' ) {
				status = 'active';
			}

			const previousStartedAt = previousSteps?.find(
				( previousStep ) => previousStep.id === step.id && previousStep.status === 'active'
			)?.startedAt;

			return {
				id: step.id as string,
				label: step.label as string,
				status,
				startedAt: status === 'active' ? previousStartedAt ?? now : undefined,
			};
		} );
}

export function useSiteGeneration( {
	siteIdentifier,
	editorUrl,
	specId,
	graph,
	steps,
}: {
	siteIdentifier: string | null;
	editorUrl: string | null;
	specId?: string | null;
	/** Graph the build was queued with, so a retry rebuilds on the same one. */
	graph?: BuildWowGraph;
	steps: Array< Pick< SiteGenerationStep, 'id' | 'label' > >;
} ): SiteGenerationState {
	const [ serverSteps, setServerSteps ] = useState< SiteGenerationStep[] | null >( null );
	const [ fallbackStartedAt, setFallbackStartedAt ] = useState( Date.now );
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
			() => setFailure( ( previous ) => previous ?? { reason: 'timed-out' } ),
			GENERATION_TIMEOUT_MS
		);
		const stopStatusPolling = pollForBuildWowStatus( {
			siteIdentifier,
			onReady: () => window.location.assign( editorUrl ),
			onFailed: ( status, ui ) => {
				logBuildWowEvent( 'site_generation_failed', {
					status,
					site_identifier: siteIdentifier,
				} );
				setFailure( ui ? { reason: 'build-failed', ui } : { reason: 'timed-out' } );
			},
			onUpdate: ( ui ) => {
				setServerSteps( ( previousSteps ) => {
					const nextSteps = getStepsFromServer( ui, previousSteps );
					return nextSteps.length > 0 ? nextSteps : previousSteps;
				} );
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
			await requestBuildWowSite( siteIdentifier, specId, graph );
			setFallbackStartedAt( Date.now() );
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
	}, [ siteIdentifier, specId, graph ] );

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
				status: index === 0 ? ( 'active' as const ) : ( 'idle' as const ),
				startedAt: index === 0 ? fallbackStartedAt : undefined,
			} ) ),
		retryBuild: canRetryBuild ? retryBuild : null,
		isRetryingBuild,
	};
}
