import { Onboard } from '@automattic/data-stores';
import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { useQuery } from '../hooks/use-query';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE } from '../stores';
import { STEPS } from './internals/steps';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import { ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';

const updateOptions: Flow = {
	name: 'update-options',
	isSignupFlow: false,
	useSteps() {
		return [ STEPS.OPTIONS, STEPS.PROCESSING, STEPS.ERROR ];
	},
	useSideEffect() {
		const { setIntent } = useDispatch( ONBOARD_STORE );

		useEffect( () => {
			setIntent( Onboard.SiteIntent.UpdateOptions );
		}, [] );
	},
	useStepNavigation( currentStep, navigate ) {
		const siteSlug = useSiteSlug();
		const flowToReturnTo = useQuery().get( 'flowToReturnTo' ) || 'free';

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		function submit( providedDependencies: ProvidedDependencies = {}, ...results: string[] ) {
			switch ( currentStep ) {
				case 'processing':
					if ( results.some( ( result ) => result === ProcessingResult.FAILURE ) ) {
						return navigate( 'error' );
					}

					return window.location.assign(
						`/setup/${ flowToReturnTo }/launchpad?siteSlug=${ siteSlug }`
					);
				case 'options': {
					return navigate( `processing?siteSlug=${ siteSlug }&flowToReturnTo=${ flowToReturnTo }` );
				}
			}
		}

		const goBack = async () => {
			switch ( currentStep ) {
				case 'options':
					return window.location.assign(
						`/setup/${ flowToReturnTo }/launchpad?siteSlug=${ siteSlug }`
					);
			}
		};

		return { goBack, submit };
	},
};

export default updateOptions;
