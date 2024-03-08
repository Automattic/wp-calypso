import { type UserSelect } from '@automattic/data-stores';
import { REBLOGGING_FLOW } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { getQueryArg, addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { USER_STORE } from '../stores';
import { useLoginUrl } from '../utils/path';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { AssertConditionResult, AssertConditionState } from './internals/types';
import type { Flow, ProvidedDependencies } from './internals/types';

const reblogging: Flow = {
	name: REBLOGGING_FLOW,
	get title() {
		return translate( 'Reblogging' );
	},
	isSignupFlow: true,
	useSteps() {
		return [
			{ slug: 'domains', asyncComponent: () => import( './internals/steps-repository/domains' ) },
			{ slug: 'plans', asyncComponent: () => import( './internals/steps-repository/plans' ) },
			{
				slug: 'createSite',
				asyncComponent: () => import( './internals/steps-repository/create-site' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
		];
	},

	useStepNavigation( _currentStepSlug, navigate ) {
		const flowName = this.name;

		triggerGuidesForStep( flowName, _currentStepSlug );

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			recordSubmitStep( providedDependencies, '', flowName, _currentStepSlug );

			switch ( _currentStepSlug ) {
				case 'domains':
					return navigate( 'plans' );

				case 'plans':
					return navigate( 'createSite' );

				case 'createSite':
					return navigate( 'processing' );

				case 'processing': {
					const postToShare = getQueryArg( window.location.search, 'blog_post' );
					const processDestination = addQueryArgs( `/post/${ providedDependencies?.siteSlug }`, {
						url: postToShare,
					} );

					if ( providedDependencies?.goToCheckout ) {
						persistSignupDestination( processDestination );
						setSignupCompleteSlug( providedDependencies?.siteSlug );
						setSignupCompleteFlowName( flowName );
						const returnUrl = encodeURIComponent( processDestination );

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								( providedDependencies?.siteSlug as string ) ?? ''
							) }?redirect_to=${ returnUrl }&signup=1`
						);
					}
					return window.location.assign( processDestination );
				}
			}
			return providedDependencies;
		};

		const goBack = () => {
			return;
		};

		const goNext = async () => {
			return;
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},

	useAssertConditions(): AssertConditionResult {
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };
		const logInUrl = useLoginUrl( {
			variationName: this.name,
			redirectTo: window.location.href.replace( window.location.origin, '' ),
		} );

		if ( ! userIsLoggedIn ) {
			window.location.assign( logInUrl );
			result = {
				state: AssertConditionState.FAILURE,
				message: 'reblogging requires a logged in user',
			};
		}

		return result;
	},
};

export default reblogging;
