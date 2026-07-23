import { useEffect, useState } from 'react';
import { pollForBuildWowReadySticker } from './blog-sticker-poller';

export type SiteGenerationStep = {
	id: string;
	label: string;
	status: 'pending' | 'active' | 'complete';
};

export type SiteGenerationState = {
	status: 'working' | 'failed';
	steps: SiteGenerationStep[];
};

const STEP_DELAYS = [ 20000, 50000, 90000, 140000 ];

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
	const hasRequiredParameters = Boolean( siteIdentifier && editorUrl );

	useEffect( () => {
		if ( ! siteIdentifier || ! editorUrl ) {
			return;
		}

		const progressTimeouts = STEP_DELAYS.map( ( delay, index ) =>
			window.setTimeout( () => setActiveStepIndex( index + 1 ), delay )
		);
		const stopPolling = pollForBuildWowReadySticker( {
			siteIdentifier,
			onReady: () => window.location.assign( editorUrl ),
		} );

		return () => {
			progressTimeouts.forEach( window.clearTimeout );
			stopPolling();
		};
	}, [ editorUrl, siteIdentifier ] );

	return {
		status: hasRequiredParameters ? 'working' : 'failed',
		steps: getStepsWithProgress( steps, activeStepIndex ),
	};
}
