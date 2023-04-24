import { PlansSelect, SiteSelect } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { useFlowProgress, VIDEOPRESS_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useSupportedPlans } from 'calypso/../packages/plans-grid/src/hooks';
import { useNewSiteVisibility } from 'calypso/landing/stepper/hooks/use-selected-plan';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import { useSiteSlug } from '../hooks/use-site-slug';
import { PLANS_STORE, SITE_STORE, USER_STORE, ONBOARD_STORE } from '../stores';
import './internals/videopress.scss';
import ChooseADomain from './internals/steps-repository/choose-a-domain';
import Intro from './internals/steps-repository/intro';
import Launchpad from './internals/steps-repository/launchpad';
import ProcessingStep from './internals/steps-repository/processing-step';
import SiteOptions from './internals/steps-repository/site-options';
import VideomakerSetup from './internals/steps-repository/videomaker-setup';
import type { Flow, ProvidedDependencies } from './internals/types';
import type { OnboardSelect, UserSelect } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

const videopress: Flow = {
	name: VIDEOPRESS_FLOW,
	get title() {
		return translate( 'Video' );
	},
	useSteps() {
		return [
			{ slug: 'intro', component: Intro },
			{ slug: 'videomakerSetup', component: VideomakerSetup },
			{ slug: 'options', component: SiteOptions },
			{ slug: 'chooseADomain', component: ChooseADomain },
			{ slug: 'processing', component: ProcessingStep },
			{ slug: 'launchpad', component: Launchpad },
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		if ( document.body ) {
			// Make sure we only target videopress stepper for body css
			if ( ! document.body.classList.contains( 'is-videopress-stepper' ) ) {
				document.body.classList.add( 'is-videopress-stepper' );
			}

			// Also target processing step for background images
			const processingStepClassName = 'is-processing-step';
			const hasProcessingStepClass = document.body.classList.contains( processingStepClassName );
			if ( 'processing' === _currentStep ) {
				if ( ! hasProcessingStepClass ) {
					document.body.classList.add( processingStepClassName );
				}
			} else if ( hasProcessingStepClass ) {
				document.body.classList.remove( processingStepClassName );
			}
		}

		const name = this.name;
		const { setDomain, setSelectedDesign, setSiteDescription, setSiteTitle, setStepProgress } =
			useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStep, flowName: name } );
		setStepProgress( flowProgress );
		const _siteSlug = useSiteSlug();
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const _siteTitle = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteTitle(),
			[]
		);
		const locale = useLocale();

		const { createVideoPressSite, setSelectedSite, setPendingAction, setProgress } =
			useDispatch( ONBOARD_STORE );
		const currentUser = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
			[]
		);
		const siteDescription = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteDescription(),
			[]
		);
		const getPlanProduct = useSelect(
			( select ) => ( select( PLANS_STORE ) as PlansSelect ).getPlanProduct,
			[]
		);
		const visibility = useNewSiteVisibility();
		const { getNewSite } = useSelect( ( select ) => select( SITE_STORE ) as SiteSelect, [] );
		const { saveSiteSettings, setIntentOnSite } = useDispatch( SITE_STORE );
		const { supportedPlans } = useSupportedPlans( locale, 'MONTHLY' );
		const selectedDomain = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDomain(),
			[]
		);

		const clearOnboardingSiteOptions = () => {
			setSiteTitle( '' );
			setSiteDescription( '' );
			setDomain( undefined );
			setSelectedDesign( undefined );
		};

		const stepValidateUserIsLoggedIn = () => {
			if ( ! userIsLoggedIn ) {
				navigate( 'intro' );
				return false;
			}
			return true;
		};

		const stepValidateSiteTitle = () => {
			if ( ! stepValidateUserIsLoggedIn() ) {
				return false;
			}

			if ( ! _siteTitle.length ) {
				navigate( 'options' );
				return false;
			}

			return true;
		};

		const addVideoPressPendingAction = () => {
			setPendingAction( async () => {
				setProgress( 0 );
				try {
					await createVideoPressSite( {
						username: currentUser ? currentUser?.username : '',
						languageSlug: locale,
						visibility,
					} );
				} catch ( e ) {
					return;
				}
				setProgress( 0.5 );

				const newSite = getNewSite();
				if ( ! newSite ) {
					return;
				}

				setSelectedSite( newSite.blogid );
				setIntentOnSite( newSite.site_slug, VIDEOPRESS_FLOW );
				saveSiteSettings( newSite.blogid, {
					launchpad_screen: 'full',
					blogdescription: siteDescription,
				} );

				let planObject = supportedPlans.find( ( plan ) => 'premium' === plan.periodAgnosticSlug );
				if ( ! planObject ) {
					planObject = supportedPlans.find( ( plan ) => 'business' === plan.periodAgnosticSlug );
				}

				const planProductObject = getPlanProduct( planObject?.periodAgnosticSlug, 'MONTHLY' );

				const cartKey = newSite.site_slug
					? await cartManagerClient.getCartKeyForSiteSlug( newSite.site_slug )
					: null;

				if ( ! cartKey ) {
					return;
				}

				const productsToAdd: MinimalRequestCartProduct[] = planProductObject
					? [
							{
								product_slug: planProductObject.storeSlug,
								extra: {
									signup_flow: VIDEOPRESS_FLOW,
								},
							},
					  ]
					: [];

				if ( selectedDomain && selectedDomain.product_slug ) {
					const registration = domainRegistration( {
						domain: selectedDomain.domain_name,
						productSlug: selectedDomain.product_slug,
						extra: { privacy_available: selectedDomain.supports_privacy },
					} );

					productsToAdd.push( registration );
				}

				setProgress( 0.75 );

				cartManagerClient
					.forCartKey( cartKey )
					.actions.addProductsToCart( productsToAdd )
					.then( () => {
						setProgress( 1.0 );
						const redirectTo = encodeURIComponent(
							`/setup/videopress/launchpad?siteSlug=${ newSite?.site_slug }&siteId=${ newSite?.blogid }`
						);

						window.location.replace(
							`/checkout/${ newSite?.site_slug }?signup=1&redirect_to=${ redirectTo }`
						);
					} );
			} );
		};

		switch ( _currentStep ) {
			case 'intro':
				clearOnboardingSiteOptions();
				break;
			case 'options':
				stepValidateUserIsLoggedIn();
				break;
			case 'chooseADomain':
				stepValidateSiteTitle();
				break;
			case 'processing':
				addVideoPressPendingAction();
				break;
		}

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( _currentStep ) {
				case 'intro':
					return navigate( 'videomakerSetup' );

				case 'videomakerSetup':
					if ( userIsLoggedIn ) {
						return navigate( 'options' );
					}

					return window.location.replace(
						`/start/videopress-account/user/${ locale }?variationName=${ name }&flow=${ name }&pageTitle=Video%20Portfolio&redirect_to=/setup/videopress/options`
					);

				case 'options': {
					const { siteTitle, tagline } = providedDependencies;
					setSiteTitle( siteTitle );
					setSiteDescription( tagline );
					return navigate( 'chooseADomain' );
				}

				case 'chooseADomain': {
					return navigate( 'processing' );
				}

				case 'launchpad': {
					clearOnboardingSiteOptions();
					return navigate( 'processing' );
				}
			}
			return providedDependencies;
		}

		const goBack = () => {
			switch ( _currentStep ) {
				case 'chooseADomain':
					return navigate( 'options' );
			}
			return;
		};

		const goNext = () => {
			switch ( _currentStep ) {
				case 'launchpad':
					return window.location.replace( `/view/${ _siteSlug }` );

				default:
					return navigate( 'intro' );
			}
		};

		const goToStep = ( step: string ) => {
			return navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default videopress;
