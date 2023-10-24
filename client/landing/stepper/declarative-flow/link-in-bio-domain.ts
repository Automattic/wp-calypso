import { PLAN_PERSONAL } from '@automattic/calypso-products';
import { useFlowProgress, LINK_IN_BIO_FLOW, LINK_IN_BIO_DOMAIN_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
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

const linkInBioDomain: Flow = {
	name: LINK_IN_BIO_FLOW,
	get title() {
		return translate( 'Link in Bio' );
	},
	variantSlug: LINK_IN_BIO_DOMAIN_FLOW,
	useAssertConditions: () => {
		const { domain } = useDomainParams();
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( ! domain ) {
			redirect( ` /setup/${ LINK_IN_BIO_FLOW }` );
			result = {
				state: AssertConditionState.FAILURE,
				message: 'link-in-bio-domain requires a domain query parameter',
			};
		}
		return result;
	},
	useSteps() {
		return [
			{ slug: 'intro', asyncComponent: () => import( './internals/steps-repository/intro' ) },
			{
				slug: 'linkInBioSetup',
				asyncComponent: () => import( './internals/steps-repository/link-in-bio-setup' ),
			},
			{
				slug: 'patterns',
				asyncComponent: () => import( './internals/steps-repository/design-carousel' ),
			},
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
		const variantSlug = this.variantSlug;
		const { setStepProgress, setHideFreePlan, setDomainCartItem, setPlanCartItem } =
			useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStepSlug, flowName, variantSlug } );
		const { domain, provider } = useDomainParams();
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

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

		const redirectTo = encodeURIComponent(
			`/setup/${ variantSlug }/patterns?domain=${ domain }&provider=${ provider }`
		);
		const logInUrl = useLoginUrl( {
			variationName: variantSlug,
			redirectTo: redirectTo,
			pageTitle: 'Link%20in%20Bio',
		} );

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			recordSubmitStep( providedDependencies, '', flowName, _currentStepSlug, variantSlug, {
				domain,
				provider,
			} );

			switch ( _currentStepSlug ) {
				case 'intro':
					clearSignupDestinationCookie();

					if ( userIsLoggedIn ) {
						return navigate( 'patterns' );
					}
					return window.location.assign( logInUrl );

				case 'patterns':
					return navigate( 'linkInBioSetup' );

				case 'linkInBioSetup': {
					if ( domain ) {
						setHideFreePlan( true );
						const domainCartItem = domainMapping( { domain } );
						setDomainCartItem( domainCartItem );
						setPlanCartItem( {
							product_slug: PLAN_PERSONAL,
						} );
					}
					return navigate( 'siteCreationStep' );
				}

				case 'siteCreationStep':
					return navigate( 'processing' );

				case 'processing': {
					const destination = `/domains/mapping/${ providedDependencies.siteSlug }/setup/${ domain }?firstVisit=true`;
					persistSignupDestination( destination );
					setSignupCompleteSlug( providedDependencies?.siteSlug );
					setSignupCompleteFlowName( variantSlug );
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

export default linkInBioDomain;
