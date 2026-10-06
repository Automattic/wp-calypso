import { useCallback, useEffect, useRef, useState } from 'react';
import { logBuildWowEvent, requestBuildWowSite } from 'calypso/landing/stepper/utils/build-wow';
import { pollForBuildWowStatus } from './build-status-poller';
import { getEditorUrlFromStatus } from './editor-url';
import { isStreamInfoEqual } from './stream/types';
import type { BuildWowUi } from './build-status-poller';
import type { BuildWowStreamInfo } from './stream/types';
import type { BuildWowGraph } from 'calypso/landing/stepper/utils/build-wow';

export type SiteGenerationStep = {
	id: string;
	label: string;
	status: 'idle' | 'active' | 'done';
	startedAt?: number;
};

export type SiteGenerationFailureReason =
	'missing-parameters' | 'timed-out' | 'build-failed' | 'editor-unavailable';

export type SiteGenerationState = {
	status: 'working' | 'failed';
	failureReason?: SiteGenerationFailureReason;
	failureLabel?: string;
	failureDetail?: string;
	steps: SiteGenerationStep[];
	retryBuild: ( () => void ) | null;
	isRetryingBuild: boolean;
	// The live feed the status endpoint advertises for this run, while working.
	streamInfo?: BuildWowStreamInfo | null;
};

const GENERATION_TIMEOUT_MS = 30 * 60 * 1000;
// The wait screen promises DSL builds in about 4 minutes; past 5, stop waiting.
const DSL_GENERATION_TIMEOUT_MS = 5 * 60 * 1000;
const STEP_TIMER_STORAGE_PREFIX = 'site-generation-step-timer-v1';

type GenerationFailure =
	{ reason: 'timed-out' | 'editor-unavailable' } | { reason: 'build-failed'; ui: BuildWowUi };

function getStoredObservedAt(
	siteIdentifier: string,
	stepId: string,
	firstObservedAt: number,
	now: number
): number {
	const storageKey = `${ STEP_TIMER_STORAGE_PREFIX }:${ siteIdentifier }`;
	const storedStepId = window.sessionStorage.getItem( `${ storageKey }:step` );
	const storedObservedAt = Number( window.sessionStorage.getItem( `${ storageKey }:observed-at` ) );
	if ( storedStepId === stepId && storedObservedAt > 0 && storedObservedAt <= now ) {
		return storedObservedAt;
	}

	const observedAt = storedStepId === null ? firstObservedAt : now;
	window.sessionStorage.setItem( `${ storageKey }:step`, stepId );
	window.sessionStorage.setItem( `${ storageKey }:observed-at`, String( observedAt ) );
	return observedAt;
}

function clearStoredStepTimer( siteIdentifier: string ): void {
	const storageKey = `${ STEP_TIMER_STORAGE_PREFIX }:${ siteIdentifier }`;
	window.sessionStorage.removeItem( `${ storageKey }:step` );
	window.sessionStorage.removeItem( `${ storageKey }:observed-at` );
}

function getStepsFromServer(
	ui: BuildWowUi,
	previousSteps: SiteGenerationStep[] | null,
	siteIdentifier: string,
	fallbackStartedAt: number,
	now: number
): SiteGenerationStep[] {
	return ( ui.steps ?? [] )
		.filter( ( step ) => step.id && step.label )
		.map( ( step, index ) => {
			let status: SiteGenerationStep[ 'status' ] = 'idle';
			if ( step.state === 'done' ) {
				status = 'done';
			} else if ( step.state === 'active' ) {
				status = 'active';
			}

			let startedAt: number | undefined;
			if ( status === 'active' ) {
				const previousStartedAt = previousSteps?.find(
					( previousStep ) => previousStep.id === step.id && previousStep.status === 'active'
				)?.startedAt;
				const firstObservedAt =
					previousStartedAt ?? ( previousSteps === null && index === 0 ? fallbackStartedAt : now );
				startedAt = getStoredObservedAt( siteIdentifier, step.id as string, firstObservedAt, now );
			}

			return {
				id: step.id as string,
				label: step.label as string,
				status,
				startedAt,
			};
		} );
}

export function useSiteGeneration( {
	siteIdentifier,
	source,
	specId,
	graph,
	streamEvents = false,
	steps,
}: {
	siteIdentifier: string | null;
	source?: string | null;
	specId?: string | null;
	/** Graph the build was queued with, so a retry rebuilds on the same one. */
	graph?: BuildWowGraph;
	/** The live-feed opt-in, so a retry asks for it again. */
	streamEvents?: boolean;
	steps: Array< Pick< SiteGenerationStep, 'id' | 'label' > >;
} ): SiteGenerationState {
	const [ serverSteps, setServerSteps ] = useState< SiteGenerationStep[] | null >( null );
	const [ fallbackStartedAt, setFallbackStartedAt ] = useState( Date.now );
	const [ failure, setFailure ] = useState< GenerationFailure | null >( null );
	const [ buildAttempt, setBuildAttempt ] = useState( 0 );
	const [ isRetryingBuild, setIsRetryingBuild ] = useState( false );
	const [ streamInfo, setStreamInfo ] = useState< BuildWowStreamInfo | null >( null );
	const isRetryingRef = useRef( false );
	const hasRequiredParameters = Boolean( siteIdentifier );
	const generationTimeoutMs = graph === 'dsl' ? DSL_GENERATION_TIMEOUT_MS : GENERATION_TIMEOUT_MS;

	useEffect( () => {
		if ( ! siteIdentifier || failure ) {
			return;
		}

		const generationTimeout = window.setTimeout(
			() => setFailure( ( previous ) => previous ?? { reason: 'timed-out' } ),
			generationTimeoutMs
		);
		const stopStatusPolling = pollForBuildWowStatus( {
			siteIdentifier,
			onReady: ( response ) => {
				clearStoredStepTimer( siteIdentifier );
				const destination = getEditorUrlFromStatus( response.site_editor_url, source );
				if ( ! destination ) {
					setFailure( { reason: 'editor-unavailable' } );
					return;
				}
				window.location.assign( destination );
			},
			onFailed: ( status, ui ) => {
				clearStoredStepTimer( siteIdentifier );
				logBuildWowEvent( 'site_generation_failed', {
					status,
					site_identifier: siteIdentifier,
				} );
				setFailure( ui ? { reason: 'build-failed', ui } : { reason: 'timed-out' } );
			},
			onUpdate: ( ui ) => {
				const now = Date.now();
				setServerSteps( ( previousSteps ) => {
					const nextSteps = getStepsFromServer(
						ui,
						previousSteps,
						siteIdentifier,
						fallbackStartedAt,
						now
					);
					return nextSteps.length > 0 ? nextSteps : previousSteps;
				} );
			},
			onStream: ( nextStreamInfo ) =>
				setStreamInfo( ( previous ) =>
					isStreamInfoEqual( previous, nextStreamInfo ) ? previous : nextStreamInfo
				),
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
	}, [ buildAttempt, source, failure, fallbackStartedAt, generationTimeoutMs, siteIdentifier ] );

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
			if ( streamEvents ) {
				await requestBuildWowSite( siteIdentifier, specId, graph, undefined, true );
			} else {
				await requestBuildWowSite( siteIdentifier, specId, graph );
			}
			clearStoredStepTimer( siteIdentifier );
			setStreamInfo( null );
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
	}, [ siteIdentifier, specId, graph, streamEvents ] );

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
		streamInfo: failureReason ? null : streamInfo,
	};
}
