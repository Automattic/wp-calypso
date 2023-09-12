import { PLAN_100_YEARS } from '@automattic/calypso-products';
import { UserSelect } from '@automattic/data-stores';
import { HUNDRED_YEAR_PLAN_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { ONBOARD_STORE, USER_STORE } from '../stores';
import { useLoginUrl } from '../utils/path';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';

const newsletter: Flow = {
	name: HUNDRED_YEAR_PLAN_FLOW,
	get title() {
		return translate( '100-year Plan' );
	},
	useSteps() {
		// const query = useQuery();
		// const isComingFromMarketingPage = query.get( 'ref' ) === 'newsletter-lp';

		return [
			// Load intro step component only when not coming from the marketing page
			// { slug: 'intro', asyncComponent: () => import( './internals/steps-repository/intro' ) },
			{
				slug: 'setup',
				asyncComponent: () => import( './internals/steps-repository/hundred-year-plan-setup' ),
			},
			{
				slug: 'domains',
				asyncComponent: () => import( './internals/steps-repository/domains' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},

			{
				slug: 'siteCreationStep',
				asyncComponent: () => import( './internals/steps-repository/site-creation-step' ),
			},
		];
	},
	useSideEffect() {
		useEffect( () => {
			clearSignupDestinationCookie();
		}, [] );
	},
	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const { setPlanCartItem } = useDispatch( ONBOARD_STORE );
		// const siteId = useSiteIdParam();

		const logInUrl = useLoginUrl( {
			variationName: flowName,
			redirectTo: `/setup/${ flowName }/setup`,
			pageTitle: 'Newsletter',
		} );

		// Send non-logged-in users to account screen.
		if ( ! userIsLoggedIn ) {
			window.location.assign( logInUrl );
		}

		// trigger guides on step movement, we don't care about failures or response
		// wpcom.req.post(
		// 	'guides/trigger',
		// 	{
		// 		apiNamespace: 'wpcom/v2/',
		// 	},
		// 	{
		// 		flow: flowName,
		// 		step: _currentStep,
		// 	}
		// );

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, '', flowName, _currentStep );

			switch ( _currentStep ) {
				case 'setup':
					return navigate( 'domains' );
				case 'domains':
					setPlanCartItem( {
						product_slug: PLAN_100_YEARS,
					} );
					return navigate( 'siteCreationStep' );
				case 'siteCreationStep':
					return navigate( 'processing' );
				case 'processing':
					if ( providedDependencies?.goToCheckout ) {
						setSignupCompleteSlug( providedDependencies?.siteSlug );
						setSignupCompleteFlowName( flowName );

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								( providedDependencies?.siteSlug as string ) ?? ''
							) }&signup=1`
						);
					}
			}
		}

		const goBack = () => {
			return;
		};

		const goNext = async () => {
			// switch ( _currentStep ) {
			// 	case 'launchpad':
			// 		if ( siteSlug ) {
			// 			await updateLaunchpadSettings( siteSlug, { launchpad_screen: 'skipped' } );
			// 		}
			// 		return window.location.assign( `/home/${ siteId ?? siteSlug }` );
			// 	default:
			// 		return navigate( isComingFromMarketingPage ? 'newsletterSetup' : 'intro' );
			// }
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default newsletter;
