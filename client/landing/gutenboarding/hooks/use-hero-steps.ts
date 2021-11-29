import { useSelect } from '@wordpress/data';
import { Step, StepType } from '../path';
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';

export function useHeroSteps(): Array< StepType > {
	const siteIntent = useSelect( ( select ) => select( ONBOARD_STORE ).getSiteIntent(), [
		ONBOARD_STORE,
	] );

	switch ( siteIntent ) {
		case '':
			return [ Step.HeroIntentGathering ];
		case 'write':
			return [
				Step.HeroIntentGathering,
				Step.HeroSiteOptions,
				Step.HeroStartingPoint,
				Step.HeroThemeSelection,
			];
		case 'build':
			return [ Step.HeroIntentGathering, Step.HeroThemeSelection ];
		case 'import':
			// TODO
			return [];
	}
}
