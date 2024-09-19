import { WRITE_FLOW } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSlug } from '../hooks/use-site-slug';
import { USER_STORE } from '../stores';
import { getLoginUrl } from '../utils/path';
import LaunchPad from './internals/steps-repository/launchpad';
import Processing from './internals/steps-repository/processing-step';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from './internals/types';
import type { UserSelect } from '@automattic/data-stores';

const write: Flow = {
	name: WRITE_FLOW,
	get title() {
		return translate( 'Write' );
	},
	isSignupFlow: false,
	useSteps() {
		return [
			{ slug: 'launchpad', component: LaunchPad },
			{ slug: 'processing', component: Processing },
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const siteId = useSiteIdParam();
		const siteSlug = useSiteSlug();

		triggerGuidesForStep( flowName, _currentStep );

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			switch ( _currentStep ) {
				case 'processing':
					if ( providedDependencies?.goToHome && providedDependencies?.siteSlug ) {
						return window.location.replace(
							addQueryArgs( `/home/${ siteId ?? providedDependencies?.siteSlug }`, {
								celebrateLaunch: true,
								launchpadComplete: true,
							} )
						);
					}

					return navigate( `launchpad` );
				case 'launchpad': {
					return navigate( 'processing' );
				}
			}
		};

		const goNext = async () => {
			switch ( _currentStep ) {
				case 'launchpad':
					skipLaunchpad( {
						checklistSlug: 'write',
						siteId,
						siteSlug,
					} );
					return;

				default:
					return navigate( 'freeSetup' );
			}
		};

		return { goNext, submit };
	},

	useAssertConditions(): AssertConditionResult {
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		const queryParams = new URLSearchParams( window.location.search );
		const flowName = this.name;

		const locale = useFlowLocale();

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

			const logInUrl = getLoginUrl( {
				variationName: flowName,
				redirectTo: redirectTarget,
				locale,
			} );

			return logInUrl + ( flags ? `&flags=${ flags }` : '' );
		};

		// Despite sending a CHECKING state, this function gets called again with the
		// /setup/write/launchpad route which has no locale in the path so we need to
		// redirect off of the first render.
		// This effects both /setup/write/<locale> starting points and /setup/write/launchpad/<locale> urls.
		// The double call also hapens on urls without locale.
		useEffect( () => {
			if ( ! userIsLoggedIn ) {
				const logInUrl = getStartUrl();
				window.location.assign( logInUrl );
			}
		}, [] );

		if ( ! userIsLoggedIn ) {
			result = {
				state: AssertConditionState.FAILURE,
				message: 'write-flow requires a logged in user',
			};
		}

		return result;
	},
};

export default write;
