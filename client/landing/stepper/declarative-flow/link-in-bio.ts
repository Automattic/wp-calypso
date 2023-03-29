import { useLocale } from '@automattic/i18n-utils';
import { useFlowProgress, LINK_IN_BIO_FLOW, LINK_IN_BIO_DOMAIN_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { domainMapping } from 'calypso/lib/cart-values/cart-items';
import wpcom from 'calypso/lib/wp';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useDomainParam } from '../hooks/use-domain-param';
import { useSiteSlug } from '../hooks/use-site-slug';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import DomainsStep from './internals/steps-repository/domains';
import Intro from './internals/steps-repository/intro';
import LaunchPad from './internals/steps-repository/launchpad';
import LinkInBioSetup from './internals/steps-repository/link-in-bio-setup';
import PatternsStep from './internals/steps-repository/patterns';
import PlansStep from './internals/steps-repository/plans';
import Processing from './internals/steps-repository/processing-step';
import SiteCreationStep from './internals/steps-repository/site-creation-step';
import type { Flow, ProvidedDependencies } from './internals/types';
import type { UserSelect } from '@automattic/data-stores';

const linkInBio: Flow = {
	name: LINK_IN_BIO_FLOW,
	get title() {
		return translate( 'Link in Bio' );
	},
	useSteps() {
		return [
			{ slug: 'intro', component: Intro },
			{ slug: 'linkInBioSetup', component: LinkInBioSetup },
			{ slug: 'domains', component: DomainsStep },
			{ slug: 'plans', component: PlansStep },
			{ slug: 'patterns', component: PatternsStep },
			{ slug: 'siteCreationStep', component: SiteCreationStep },
			{ slug: 'processing', component: Processing },
			{ slug: 'launchpad', component: LaunchPad },
		];
	},

	useStepNavigation( _currentStepSlug, navigate ) {
		const flowName = this.name;
		const variantSlug = this.variantSlug;
		const { setStepProgress, setHideFreePlan, setDomainCartItem } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStepSlug, flowName } );
		const siteSlug = useSiteSlug();
		const domain = useDomainParam();
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const locale = useLocale();

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

		const logInUrl =
			locale && locale !== 'en'
				? `/start/account/user/${ locale }?variationName=${ flowName }&pageTitle=Link%20in%20Bio&redirect_to=/setup/${ flowName }/patterns`
				: `/start/account/user?variationName=${ flowName }&pageTitle=Link%20in%20Bio&redirect_to=/setup/${ flowName }/patterns`;

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			recordSubmitStep( providedDependencies, '', flowName, _currentStepSlug, variantSlug );

			switch ( _currentStepSlug ) {
				case 'intro':
					clearSignupDestinationCookie();

					if ( userIsLoggedIn ) {
						return navigate( 'patterns' );
					}
					return window.location.assign( logInUrl );

				case 'patterns':
					return navigate( 'linkInBioSetup' );

				case 'linkInBioSetup':
					if ( variantSlug === LINK_IN_BIO_DOMAIN_FLOW && domain ) {
						setHideFreePlan( true );
						//set domain connect
						const domainCartItem = domainMapping( { domain } );
						setDomainCartItem( domainCartItem );
						return navigate( 'plans' );
					}
					return navigate( 'domains' );

				case 'domains':
					return navigate( 'plans' );

				case 'plans':
					return navigate( 'siteCreationStep' );

				case 'siteCreationStep':
					return navigate( 'processing' );

				case 'processing':
					if ( providedDependencies?.goToHome && providedDependencies?.siteSlug ) {
						return window.location.replace(
							addQueryArgs( `/home/${ providedDependencies?.siteSlug }`, {
								celebrateLaunch: true,
								launchpadComplete: true,
							} )
						);
					}

					if ( providedDependencies?.goToCheckout ) {
						let destination = '';
						if ( variantSlug === LINK_IN_BIO_DOMAIN_FLOW ) {
							destination = `/domains/mapping/${ providedDependencies.siteSlug }/setup/${ domain }?firstVisit=true`;
						} else {
							destination = `/setup/${ flowName }/launchpad?siteSlug=${ providedDependencies.siteSlug }`;
						}
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

					return navigate( `launchpad?siteSlug=${ providedDependencies?.siteSlug }` );

				case 'launchpad': {
					return navigate( 'processing' );
				}
			}
			return providedDependencies;
		};

		const goBack = () => {
			return;
		};

		const goNext = () => {
			switch ( _currentStepSlug ) {
				case 'launchpad':
					return window.location.assign( `/view/${ siteSlug }` );

				default:
					return navigate( 'intro' );
			}
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default linkInBio;
