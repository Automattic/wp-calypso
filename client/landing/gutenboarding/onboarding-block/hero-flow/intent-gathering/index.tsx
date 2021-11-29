import { useDispatch } from '@wordpress/data';
import ImportedIntentScreen from 'calypso/signup/steps/intent/intent-screen';
import { useHeroStepNavigation } from '../../../hooks/use-hero-navigation';
import { Step } from '../../../path';
import { STORE_KEY as ONBOARD_STORE } from '../../../stores/onboard';
import type { SiteIntent } from '../../../stores/onboard/types';

export function HeroFlowIntentGathering(): React.ReactElement {
	const { setSiteIntent } = useDispatch( ONBOARD_STORE );
	const { goNext } = useHeroStepNavigation();

	const handleClick = ( intent: SiteIntent ) => {
		setSiteIntent( intent );
		goNext( intent === 'write' ? Step.HeroSiteOptions : Step.HeroThemeSelection );
	};

	return <ImportedIntentScreen onSelect={ handleClick } />;
}
