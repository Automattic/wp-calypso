import { updateLaunchpadSettings } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { useFlowProgress, WRITE_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { getLocaleFromQueryParam, getLocaleFromPathname } from 'calypso/boot/locale';
import wpcom from 'calypso/lib/wp';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSlug } from '../hooks/use-site-slug';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import { getLoginUrl } from '../utils/path';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
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
		const siteId = useSiteIdParam();
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
					if ( siteSlug ) {
						await updateLaunchpadSettings( siteSlug, { launchpad_screen: 'skipped' } );
					}
					return window.location.assign( `/home/${ siteId ?? siteSlug }` );

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

		// There is a race condition where useLocale is reporting english,
		// despite there being a locale in the URL so we need to look it up manually.
		// We also need to support both query param and path suffix localized urls
		// depending on where the user is coming from.
		const useLocaleSlug = useLocale();
		// Query param support can be removed after dotcom-forge/issues/2960 and 2961 are closed.
		const queryLocaleSlug = getLocaleFromQueryParam();
		const pathLocaleSlug = getLocaleFromPathname();
		const locale = queryLocaleSlug || pathLocaleSlug || useLocaleSlug;

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
