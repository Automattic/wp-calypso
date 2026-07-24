import { useEffect, useState } from 'react';
import { pollForBuildWowReadySticker } from './blog-sticker-poller';

export type SiteGenerationStep = {
	id: string;
	label: string;
	status: 'pending' | 'active' | 'complete';
};

export type SiteGenerationFailureReason = 'missing-parameters' | 'timed-out';

export type SiteGenerationState = {
	status: 'working' | 'failed';
	failureReason?: SiteGenerationFailureReason;
	steps: SiteGenerationStep[];
};

const STEP_DELAYS = [ 20000, 50000, 90000, 140000 ];
const GENERATION_TIMEOUT_MS = 30 * 60 * 1000;

function getStepsWithProgress(
	steps: Array< Pick< SiteGenerationStep, 'id' | 'label' > >,
	activeStepIndex: number
): SiteGenerationStep[] {
	return steps.map( ( step, index ) => {
		let status: SiteGenerationStep[ 'status' ] = 'pending';
		if ( index < activeStepIndex ) {
			status = 'complete';
		} else if ( index === activeStepIndex ) {
			status = 'active';
		}
		return { ...step, status };
	} );
}

export function useSiteGeneration( {
	siteIdentifier,
	editorUrl,
	steps,
}: {
	siteIdentifier: string | null;
	editorUrl: string | null;
	steps: Array< Pick< SiteGenerationStep, 'id' | 'label' > >;
} ): SiteGenerationState {
	const [ activeStepIndex, setActiveStepIndex ] = useState( 0 );
	const [ hasTimedOut, setHasTimedOut ] = useState( false );
	const hasRequiredParameters = Boolean( siteIdentifier && editorUrl );

	useEffect( () => {
		if ( ! siteIdentifier || ! editorUrl || hasTimedOut ) {
			return;
		}

		const progressTimeouts = STEP_DELAYS.map( ( delay, index ) =>
			window.setTimeout( () => setActiveStepIndex( index + 1 ), delay )
		);
		const generationTimeout = window.setTimeout(
			() => setHasTimedOut( true ),
			GENERATION_TIMEOUT_MS
		);
		const stopPolling = pollForBuildWowReadySticker( {
			siteIdentifier,
			onReady: () => window.location.assign( editorUrl ),
		} );

		return () => {
			progressTimeouts.forEach( window.clearTimeout );
			window.clearTimeout( generationTimeout );
			stopPolling();
		};
	}, [ editorUrl, siteIdentifier, hasTimedOut ] );

	let failureReason: SiteGenerationFailureReason | undefined;
	if ( ! hasRequiredParameters ) {
		failureReason = 'missing-parameters';
	} else if ( hasTimedOut ) {
		failureReason = 'timed-out';
	}

	return {
		status: failureReason ? 'failed' : 'working',
		failureReason,
		steps: getStepsWithProgress( steps, activeStepIndex ),
	};
}
