import { type UserSelect } from '@automattic/data-stores';
import { useFlowProgress, REBLOGGING_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import wpcom from 'calypso/lib/wp';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import { useLoginUrl } from '../utils/path';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { AssertConditionResult, AssertConditionState } from './internals/types';
import type { Flow, ProvidedDependencies } from './internals/types';

const reblogging: Flow = {
	name: REBLOGGING_FLOW,
	get title() {
		return translate( 'Reblogging' );
	},
	useSteps() {
		return [
			{ slug: 'domains', asyncComponent: () => import( './internals/steps-repository/domains' ) },
			{ slug: 'plans', asyncComponent: () => import( './internals/steps-repository/plans' ) },
			{
				slug: 'siteCreationStep',
				asyncComponent: () => import( './internals/steps-repository/site-creation-step' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
		];
	},

	useStepNavigation( _currentStepSlug, navigate ) {
		const flowName = this.name;
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStepSlug, flowName } );

		setStepProgress( flowProgress );

		// trigger guides on step movement, we don't care about failures or response
		wpcom.req.post(
			'guides/trigger',
			{
				apiNamespace: 'wpcom/v2/',
			},
			{
				flow: flowName,
				step: _currentStepSlug,
			}
		);

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			recordSubmitStep( providedDependencies, '', flowName, _currentStepSlug );

			switch ( _currentStepSlug ) {
				case 'domains':
					return navigate( 'plans' );

				case 'plans':
					return navigate( 'siteCreationStep' );

				case 'siteCreationStep':
					return navigate( 'processing' );

				case 'processing':
					if ( providedDependencies?.goToCheckout ) {
						const destination = `/post?url=https://mmm434.wordpress.com/2023/09/26/hello-world/?page_id=3&is_post_share=true&v=5`;
						persistSignupDestination( destination );
						setSignupCompleteSlug( providedDependencies?.siteSlug );
						setSignupCompleteFlowName( flowName );
						const returnUrl = encodeURIComponent( destination );

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								( providedDependencies?.siteSlug as string ) ?? ''
							) }?redirect_to=${ returnUrl }&signup=1`
						);
					}
					return window.location.assign(
						`/post?url=https://mmm434.wordpress.com/2023/09/26/hello-world/?page_id=3&is_post_share=true&v=5`
					);
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
