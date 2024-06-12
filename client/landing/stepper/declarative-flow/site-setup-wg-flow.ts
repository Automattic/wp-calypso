import { Onboard } from '@automattic/data-stores';
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { ONBOARD_STORE } from '../stores';
import { Flow } from './internals/types';
import siteSetup from './site-setup-flow';

const { goalsToIntent } = Onboard.utils;

/**
 * A variant of site-setup flow without goals step.
 */
const siteSetupWithoutGoalsFlow: Flow = {
	...siteSetup,
	variantSlug: 'site-setup-wg',
	useSteps() {
		return siteSetup.useSteps().slice( 2 );
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
