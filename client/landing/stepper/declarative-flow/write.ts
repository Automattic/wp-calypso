import { useLocale } from '@automattic/i18n-utils';
import { useFlowProgress, WRITE_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import { useSiteSlug } from '../hooks/use-site-slug';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import LaunchPad from './internals/steps-repository/launchpad';
import Processing from './internals/steps-repository/processing-step';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from './internals/types';

const write: Flow = {
	name: WRITE_FLOW,
	get title() {
		return translate( 'Write' );
	},
	useSteps() {
		return [
			{ slug: 'launchpad', component: LaunchPad },
			{ slug: 'processing', component: Processing },
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStep, flowName } );
		setStepProgress( flowProgress );
		const siteSlug = useSiteSlug();

		// trigger guides on step movement, we don't care about failures or response
		wpcom.req.post(
			'guides/trigger',
			{
				apiNamespace: 'wpcom/v2/',
			},
			{
				flow: flowName,
				step: _currentStep,
			}
		);

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			recordSubmitStep( providedDependencies, '', flowName, _currentStep );

			switch ( _currentStep ) {
				case 'processing':
					if ( providedDependencies?.goToHome && providedDependencies?.siteSlug ) {
						return window.location.replace(
							`/home/${ providedDependencies?.siteSlug }?celebrateLaunch=true&launchpadComplete=true`
						);
					}

					return navigate( `launchpad` );
				case 'launchpad': {
					return navigate( 'processing' );
				}
			}
		};

		const goNext = () => {
			switch ( _currentStep ) {
				case 'launchpad':
					return window.location.assign( `/view/${ siteSlug }` );

				default:
					return navigate( 'freeSetup' );
			}
		};

		return { goNext, submit };
	},

	useAssertConditions(): AssertConditionResult {
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		const queryParams = new URLSearchParams( window.location.search );
		const flowName = this.name;
		const locale = useLocale();
		const flags = queryParams.get( 'flags' );
		const siteSlug = queryParams.get( 'siteSlug' );

		const getStartUrl = () => {
			let hasFlowParams = false;
			const flowParams = new URLSearchParams();

			if ( siteSlug ) {
				flowParams.set( 'siteSlug', siteSlug );
				hasFlowParams = true;
			}

			if ( locale && locale !== 'en' ) {
				flowParams.set( 'locale', locale );
				hasFlowParams = true;
			}

			const redirectTarget =
				window?.location?.pathname +
				( hasFlowParams ? encodeURIComponent( '?' + flowParams.toString() ) : '' );

			const url =
				locale && locale !== 'en'
					? `/start/account/user/${ locale }?variationName=${ flowName }&redirect_to=${ redirectTarget }`
					: `/start/account/user?variationName=${ flowName }&redirect_to=${ redirectTarget }`;

			return url + ( flags ? `&flags=${ flags }` : '' );
		};

		if ( ! userIsLoggedIn ) {
			const logInUrl = getStartUrl();
			window.location.assign( logInUrl );
			result = {
				state: AssertConditionState.FAILURE,
				message: 'write-flow requires a logged in user',
			};
		}

		return result;
	},
};

export default write;
