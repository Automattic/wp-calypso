import { Onboard } from '@automattic/data-stores';
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { useSiteData } from '../hooks/use-site-data';
import { ONBOARD_STORE } from '../stores';
import { FlowV1 } from './internals/types';
import siteSetup from './site-setup-flow';

const { goalsToIntent } = Onboard.utils;

/**
 * A variant of site-setup flow without goals step.
 */
const siteSetupWithoutGoalsFlow: FlowV1 = {
	...siteSetup,
	variantSlug: 'site-setup-wg',
	useSteps() {
		return siteSetup.useSteps().slice( 2 );
	},
	useStepNavigation( currentStep, navigate ) {
		const navigation = siteSetup.useStepNavigation( currentStep, navigate );
		const isFirstStep = this.useSteps()[ 0 ].slug === currentStep;
		// Delete `goBack` function on the first step fo the flow.
		if ( isFirstStep ) {
			delete navigation.goBack;
		}
		return navigation;
	},
	useSideEffect( currentStep, navigate ) {
		const { setIntent, setGoals } = useDispatch( ONBOARD_STORE );
		const { site } = useSiteData();

		useEffect( () => {
			setIntent( goalsToIntent( site?.options?.site_goals ?? [] ) );
			setGoals( site?.options?.site_goals ?? [] );
		}, [ site, setIntent, setGoals ] );

		return siteSetup.useSideEffect?.( currentStep, navigate );
	},
};

export default siteSetupWithoutGoalsFlow;
