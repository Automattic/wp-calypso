import { useLocale } from '@automattic/i18n-utils';
import { CONNECT_DOMAIN_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { getLocaleFromQueryParam, getLocaleFromPathname } from 'calypso/boot/locale';
import { domainMapping } from 'calypso/lib/cart-values/cart-items';
import wpcom from 'calypso/lib/wp';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useDomainParams } from '../hooks/use-domain-params';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import { useLoginUrl } from '../utils/path';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { redirect } from './internals/steps-repository/import/util';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from './internals/types';
import type { UserSelect } from '@automattic/data-stores';

const connectDomain: Flow = {
	name: CONNECT_DOMAIN_FLOW,
	get title() {
		return translate( 'Connect your domain' );
	},
	useAssertConditions: () => {
		const { domain, provider } = useDomainParams();
		const flowName = CONNECT_DOMAIN_FLOW;

		// There is a race condition where useLocale is reporting english,
		// despite there being a locale in the URL so we need to look it up manually.
		// We also need to support both query param and path suffix localized urls
		// depending on where the user is coming from.
		const useLocaleSlug = useLocale();
		// Query param support can be removed after dotcom-forge/issues/2960 and 2961 are closed.
		const queryLocaleSlug = getLocaleFromQueryParam();
		const pathLocaleSlug = getLocaleFromPathname();
		const locale = queryLocaleSlug || pathLocaleSlug || useLocaleSlug;

		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		if ( ! domain ) {
			redirect( ` /setup/${ CONNECT_DOMAIN_FLOW }` ); //TODO
			result = {
				state: AssertConditionState.FAILURE,
				message: 'connect-domain requires a domain query parameter',
			};
		}

		const logInUrl = useLoginUrl( {
			variationName: flowName,
			redirectTo: `/setup/${ flowName }/plans?domain=${ domain }&provider=${ provider }}`,
			pageTitle: 'Connect your Domain',
			locale,
		} );

		// Despite sending a CHECKING state, this function gets called again with the
		// /setup/blog/blogger-intent route which has no locale in the path so we need to
		// redirect off of the first render.
		// This effects both /setup/blog/<locale> starting points and /setup/blog/blogger-intent/<locale> urls.
		// The double call also hapens on urls without locale.
		useEffect( () => {
			if ( ! userIsLoggedIn ) {
				redirect( logInUrl );
			}
		}, [] );

		if ( ! userIsLoggedIn ) {
			return {
				state: AssertConditionState.FAILURE,
			};
		}

		return result;
	},
	useSideEffect() {
		const { domain } = useDomainParams();
		const { setHideFreePlan, setDomainCartItem } = useDispatch( ONBOARD_STORE );

		useEffect( () => {
			if ( domain ) {
				setHideFreePlan( true );
				const domainCartItem = domainMapping( { domain } );
				setDomainCartItem( domainCartItem );
			}
		}, [] );
	},
	useSteps() {
		return [
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
		const { domain, provider } = useDomainParams();

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
			recordSubmitStep( providedDependencies, '', flowName, _currentStepSlug, undefined, {
				provider,
				domain,
			} );

			switch ( _currentStepSlug ) {
				case 'plans':
					clearSignupDestinationCookie();
					return navigate( 'siteCreationStep' );

				case 'siteCreationStep':
					return navigate( 'processing' );

				case 'processing': {
					const destination = `/domains/mapping/${ providedDependencies.siteSlug }/setup/${ domain }?firstVisit=true`;
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
			}
			return providedDependencies;
		};

		return {
			submit,
		};
	},
};

export default connectDomain;
