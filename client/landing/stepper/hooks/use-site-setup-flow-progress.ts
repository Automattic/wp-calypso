import { Onboard } from '@automattic/data-stores';

const SiteIntent = Onboard.SiteIntent;
const MAX_STEPS = 10;

export function useSiteSetupFlowProgress( currentStep: string, intent: string ) {
	const beginningSteps = [ 'goals', 'vertical' ];

	let beginningSegment = ( beginningSteps.length - 1 ) / MAX_STEPS;
	let middleSegment = 0;
	let middleProgress: { progress: number; count: number } | null = null;
	let flowProgress;

	switch ( currentStep ) {
		case 'goals':
		case 'vertical':
		case 'intent':
			beginningSegment = beginningSteps.indexOf( currentStep );
			break;
		case 'difmStartingPoint':
			return { progress: 0, count: 0 };
	}

	switch ( intent ) {
		case SiteIntent.Write: {
			switch ( currentStep ) {
				case 'options':
					middleProgress = { progress: 1, count: 4 };
					break;
				case 'bloggerStartingPoint':
					middleProgress = { progress: 2, count: 4 };
					break;
				case 'courses':
				case 'designSetup':
					middleProgress = { progress: 3, count: 4 };
					break;
			}

			break;
		}
		case SiteIntent.Build: {
			switch ( currentStep ) {
				case 'designSetup':
					middleProgress = { progress: 1, count: 3 };
					break;
				case 'patternAssembler':
					middleProgress = { progress: 2, count: 3 };
					break;
			}

			break;
		}
		case SiteIntent.Sell: {
			switch ( currentStep ) {
				case 'options':
					middleProgress = { progress: 1, count: 8 };
					break;
			}

			switch ( currentStep ) {
				case 'goals':
					middleProgress = { progress: 1, count: 4 };
					break;
				case 'vertical':
					middleProgress = { progress: 2, count: 4 };
					break;
				case 'options':
					middleProgress = { progress: 3, count: 4 };
					break;
				case 'designSetup':
					middleProgress = { progress: 4, count: 4 };
					break;
			}

			break;
		}
		case SiteIntent.Import: {
			switch ( currentStep ) {
				case 'import':
					middleProgress = { progress: 1, count: 4 };
					break;
				case 'importList':
				case 'importReady':
				case 'importReadyNot':
				case 'importReadyWpcom':
				case 'importReadyPreview': {
					middleProgress = { progress: 2, count: 4 };
					break;
				}
				case 'importerWix':
				case 'importerBlogger':
				case 'importerMedium':
				case 'importerSquarespace':
				case 'importerWordpress':
					middleProgress = { progress: 3, count: 4 };
					break;
			}

			break;
		}
	}

	if ( middleProgress ) {
		middleSegment = ( middleProgress.progress / middleProgress.count ) * MAX_STEPS;
	}

	flowProgress = beginningSegment + middleSegment;

	if ( currentStep === 'processing' ) {
		flowProgress = MAX_STEPS;
	}

	return { progress: flowProgress, count: MAX_STEPS };
}
