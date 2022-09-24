import { useLocale } from '@automattic/i18n-utils';
import { useFlowProgress, LINK_IN_BIO_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSiteSlug } from '../hooks/use-site-slug';
import { createSiteWithCart } from '../lib/signup/utils';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';

export const linkInBio: Flow = {
	name: LINK_IN_BIO_FLOW,
	title: 'Link in Bio',
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
		}, [] );

		return [
			'intro',
			'linkInBioSetup',
			'domains',
			'patterns',
			'processing',
			'launchpad',
		] as StepPath[];
	},

	useStepNavigation( _currentStep, navigate ) {
		const name = this.name;
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStep, flowName: name } );
		setStepProgress( flowProgress );
		const siteSlug = useSiteSlug();
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
		const locale = useLocale();

		const getStartUrl = () => {
			return locale && locale !== 'en'
				? `/start/account/user/${ locale }?variationName=${ name }&pageTitle=Link%20in%20Bio&redirect_to=/setup/patterns?flow=${ name }`
				: `/start/account/user?variationName=${ name }&pageTitle=Link%20in%20Bio&redirect_to=/setup/patterns?flow=${ name }`;
		};

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			const logInUrl = getStartUrl();

			switch ( _currentStep ) {
				case 'intro':
					if ( userIsLoggedIn ) {
						return navigate( 'patterns' );
					}
					return window.location.assign( logInUrl );

				case 'patterns':
					return navigate( 'linkInBioSetup' );

				case 'linkInBioSetup':
					return navigate( 'domains' );
				// return window.location.assign(
				// 	`/start/${ name }/domains?new=${ encodeURIComponent(
				// 		providedDependencies.siteTitle as string
				// 	) }&search=yes&hide_initial_query=yes`
				// );

				case 'domains':
					createSiteWithCart(
						name,
						providedDependencies.siteSlug,
						false,
						{
							domainItem: {
								is_domain_registration: true,
								meta: providedDependencies.siteSlug,
								product_slug: providedDependencies.productSlug,
							},
							flowName: undefined,
							lastKnownFlow: name,
							googleAppsCartItem: undefined,
							isPurchasingItem: true,
							siteUrl: providedDependencies.siteSlug,
							themeSlugWithRepo: undefined,
							themeItem: undefined,
							siteAccentColor: '#0675C4',
						},
						userIsLoggedIn,
						false,
						( error, siteDependencies ) => {
							//With createSiteWithCart we have the right siteSlug and domainItem to pass to plans.
							//Currently we only pass siteSlug, but we shall save domainItem in the store
							return window.location.assign(
								`/start/${ name }/plans-link-in-bio?siteSlug=${ encodeURIComponent(
									siteDependencies.siteSlug as string
								) }`
							);
						}
					);
					break;
				// return window.location.assign( `/start/${ name }/plans-link-in-bio` );

				case 'launchpad': {
					return navigate( 'processing' );
				}
			}
			return providedDependencies;
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			switch ( _currentStep ) {
				case 'launchpad':
					return window.location.assign( `/view/${ siteSlug }` );

				default:
					return navigate( 'intro' );
			}
		};

		const goToStep = ( step: StepPath | `${ StepPath }?${ string }` ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};
