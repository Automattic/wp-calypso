/* eslint-disable wpcalypso/jsx-classname-namespace */
import { PlansSelect, ProductsList, SiteSelect, UserSelect } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import { useSupportedPlans } from 'calypso/../packages/plans-grid/src/hooks';
import QueryProductsList from 'calypso/components/data/query-products-list';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import FormattedHeader from 'calypso/components/formatted-header';
import { useNewSiteVisibility } from 'calypso/landing/stepper/hooks/use-selected-plan';
import { ONBOARD_STORE, PLANS_STORE, SITE_STORE, USER_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

import './style.scss';

const ChooseADomain: Step = function ChooseADomain( { navigation, flow } ) {
	const { goNext, goBack, submit } = navigation;
	const { __ } = useI18n();
	const locale = useLocale();
	const isVideoPressFlow = 'videopress' === flow;
	const { siteTitle, domain, productsList } = useSelect(
		( select ) => ( {
			siteTitle: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteTitle(),
			domain: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDomain(),
			productsList: select( ProductsList.store ).getProductsList(),
		} ),
		[]
	);
	const { setDomain, createVideoPressSite, setSelectedSite, setPendingAction, setProgress } =
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

	const getDefaultStepContent = () => <h1>Choose a domain step</h1>;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onAddDomain = ( selectedDomain: any ) => {
		setDomain( selectedDomain );

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
			setSelectedSite( newSite?.blogid );
			setIntentOnSite( newSite?.site_slug as string, flow as string );
			saveSiteSettings( newSite?.blogid as number, {
				launchpad_screen: 'full',
				blogdescription: siteDescription,
			} );

			let planObject = supportedPlans.find( ( plan ) => 'premium' === plan.periodAgnosticSlug );
			if ( ! planObject ) {
				planObject = supportedPlans.find( ( plan ) => 'business' === plan.periodAgnosticSlug );
			}

			const planProductObject = getPlanProduct( planObject?.periodAgnosticSlug, 'MONTHLY' );

			const cartKey = await cartManagerClient.getCartKeyForSiteSlug( newSite?.site_slug as string );

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const productsToAdd: any[] = [
				{
					product_slug: planProductObject?.storeSlug,
					extra: {
						signup_flow: flow,
					},
				},
			];

			if ( selectedDomain && selectedDomain.product_slug ) {
				const registration = domainRegistration( {
					domain: selectedDomain.domain_name,
					productSlug: selectedDomain.product_slug as string,
					extra: { privacy_available: selectedDomain.supports_privacy },
				} );

				productsToAdd.push( registration );
			}

			setProgress( 0.75 );

			await cartManagerClient.forCartKey( cartKey ).actions.addProductsToCart( productsToAdd );

			setProgress( 1.0 );

			const redirectTo = encodeURIComponent(
				`/setup/videopress/launchpad?siteSlug=${ newSite?.site_slug }&siteId=${ newSite?.blogid }`
			);

			window.location.replace(
				`/checkout/${ newSite?.site_slug }?signup=1&redirect_to=${ redirectTo }`
			);
		} );

		submit?.( { domain: selectedDomain } );
	};

	const onSkip = () => {
		onAddDomain( null );
	};

	const getVideoPressFlowStepContent = () => {
		const domainSuggestion = domain ? domain.domain_name : siteTitle;

		return (
			<CalypsoShoppingCartProvider>
				<RegisterDomainStep
					vendor={ flow }
					basePath=""
					suggestion={ domainSuggestion }
					domainsWithPlansOnly={ true }
					isSignupStep={ true }
					includeWordPressDotCom={ true }
					includeDotBlogSubdomain={ false }
					showAlreadyOwnADomain={ false }
					onAddDomain={ onAddDomain }
					onSkip={ onSkip }
					products={ productsList }
					useProvidedProductsList={ true }
				/>
				<div className="aside-sections">
					<div className="aside-section">
						<h2>{ __( 'Get a free one-year domain with any paid plan.' ) }</h2>
						<span>
							{ __( "You can claim your free custom domain later if you aren't ready yet." ) }
						</span>
						<button
							className="button navigation-link step-container__navigation-link has-underline is-borderless"
							onClick={ onSkip }
						>
							{ __( 'View plans' ) }
						</button>
					</div>
					<span className="aside-spacer"></span>
					<div className="aside-section">
						<h2>{ __( 'Already own a domain?' ) }</h2>
						<span>
							{ __(
								'A domain name is the site address people type in their browser to visit your site.'
							) }
						</span>
						<button
							className="button navigation-link step-container__navigation-link has-underline is-borderless"
							onClick={ onSkip }
						>
							{ __( 'Use a domain I own' ) }
						</button>
					</div>
				</div>
			</CalypsoShoppingCartProvider>
		);
	};

	const getFormattedHeader = () => {
		if ( ! isVideoPressFlow ) {
			return undefined;
		}

		return (
			<FormattedHeader
				id="choose-a-domain-header"
				headerText={ __( 'Choose a domain' ) }
				subHeaderText={
					<>
						{ __( 'Make your video site shine with a custom domain. Not sure yet?' ) }
						<button
							className="button navigation-link step-container__navigation-link has-underline is-borderless"
							onClick={ onSkip }
						>
							{ __( 'Decide later.' ) }
						</button>
					</>
				}
				align="center"
			/>
		);
	};

	const stepContent = isVideoPressFlow ? getVideoPressFlowStepContent() : getDefaultStepContent();

	return (
		<>
			<QueryProductsList />
			<StepContainer
				stepName="chooseADomain"
				shouldHideNavButtons={ isVideoPressFlow }
				goBack={ goBack }
				goNext={ goNext }
				isHorizontalLayout={ false }
				isWideLayout={ true }
				isLargeSkipLayout={ false }
				stepContent={ stepContent }
				recordTracksEvent={ recordTracksEvent }
				formattedHeader={ getFormattedHeader() }
			/>
		</>
	);
};

export default ChooseADomain;
