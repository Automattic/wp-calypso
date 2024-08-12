import { Site } from '@automattic/data-stores';
import { FREE_THEME } from '@automattic/design-picker';
import {
	ECOMMERCE_FLOW,
	ENTREPRENEUR_FLOW,
	StepContainer,
	WOOEXPRESS_FLOW,
	addPlanToCart,
	addProductsToCart,
	createSiteWithCart,
	isCopySiteFlow,
	isDesignFirstFlow,
	isFreeFlow,
	isLinkInBioFlow,
	isImportFocusedFlow,
	isMigrationSignupFlow,
	isStartWritingFlow,
	isWooExpressFlow,
	isEntrepreneurFlow,
	isNewHostedSiteCreationFlow,
	isNewsletterFlow,
	isBlogOnboardingFlow,
	isSiteAssemblerFlow,
	isReadymadeFlow,
	setThemeOnSite,
	AI_ASSEMBLER_FLOW,
} from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { getQueryArg } from '@wordpress/url';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingBar } from 'calypso/components/loading-bar';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import useAddEcommerceTrialMutation from 'calypso/data/ecommerce/use-add-ecommerce-trial-mutation';
import useAddTempSiteToSourceOptionMutation from 'calypso/data/site-migration/use-add-temp-site-mutation';
import { useSourceMigrationStatusQuery } from 'calypso/data/site-migration/use-source-migration-status-query';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	retrieveSignupDestination,
	getSignupCompleteFlowName,
	wasSignupCheckoutPageUnloaded,
	getSignupCompleteSlug,
} from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import './styles.scss';

const DEFAULT_SITE_MIGRATION_THEME = 'pub/zoologist';
const DEFAULT_LINK_IN_BIO_THEME = 'pub/lynx';
const DEFAULT_WOOEXPRESS_FLOW = 'pub/twentytwentytwo';
const DEFAULT_ENTREPRENEUR_FLOW = 'pub/twentytwentytwo';
const DEFAULT_NEWSLETTER_THEME = 'pub/lettre';
const DEFAULT_START_WRITING_THEME = 'pub/hey';

function hasSourceSlug( data: unknown ): data is { sourceSlug: string } {
	if ( data && ( data as { sourceSlug: string } ).sourceSlug ) {
		return true;
	}
	return false;
}

const CreateSite: Step = function CreateSite( { navigation, flow, data } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const partnerBundle = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPartnerBundle(),
		[]
	);
	const { mutateAsync: addEcommerceTrial } = useAddEcommerceTrialMutation( partnerBundle );

	const urlData = useSelector( getUrlData );

	const { domainItem, domainCartItem, planCartItem, selectedSiteTitle, productCartItems } =
		useSelect(
			( select ) => ( {
				domainItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDomain(),
				domainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem(),
				planCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
				productCartItems: ( select( ONBOARD_STORE ) as OnboardSelect ).getProductCartItems(),
				selectedSiteTitle: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteTitle(),
			} ),
			[]
		);

	const username = useSelector( getCurrentUserName );

	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	// when it's empty, the default WordPress theme will be used.
	let theme = '';
	if ( isImportFocusedFlow( flow ) || isCopySiteFlow( flow ) ) {
		theme = DEFAULT_SITE_MIGRATION_THEME;
	} else if ( isWooExpressFlow( flow ) ) {
		theme = DEFAULT_WOOEXPRESS_FLOW;
	} else if ( isEntrepreneurFlow( flow ) ) {
		theme = DEFAULT_ENTREPRENEUR_FLOW;
	} else if ( isStartWritingFlow( flow ) ) {
		theme = DEFAULT_START_WRITING_THEME;
	} else if ( isLinkInBioFlow( flow ) ) {
		theme = DEFAULT_LINK_IN_BIO_THEME;
	} else if ( isNewsletterFlow( flow ) ) {
		theme = DEFAULT_NEWSLETTER_THEME;
	} else if ( flow === AI_ASSEMBLER_FLOW ) {
		theme = 'pub/assembler';
	}

	let preselectedThemeSlug = '';
	let preselectedThemeStyleVariation = '';

	// Maybe set the theme for the user instead of taking them to the update-design flow.
	// See: https://github.com/Automattic/wp-calypso/issues/83077
	if ( isDesignFirstFlow( flow ) ) {
		const themeSlug = getQueryArg( window.location.href, 'theme' );
		const themeType = getQueryArg( window.location.href, 'theme_type' );
		const styleVariation = getQueryArg( window.location.href, 'style_variation' );

		// Only do this for preselected free themes with style variation.
		if ( !! themeSlug && themeType === FREE_THEME && !! styleVariation ) {
			preselectedThemeSlug = `pub/${ themeSlug }`;
			preselectedThemeStyleVariation = styleVariation as string;
		}
	}

	const isPaidDomainItem = Boolean( domainCartItem?.product_slug );

	const progress = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getProgress(),
		[]
	);
	const { setProgress } = useDispatch( ONBOARD_STORE );

	// Default visibility is public
	let siteVisibility = Site.Visibility.PublicIndexed;
	const wooFlows = [ ECOMMERCE_FLOW, ENTREPRENEUR_FLOW, WOOEXPRESS_FLOW ];

	// These flows default to "Coming Soon"
	if (
		isCopySiteFlow( flow ) ||
		isFreeFlow( flow ) ||
		isLinkInBioFlow( flow ) ||
		isImportFocusedFlow( flow ) ||
		isBlogOnboardingFlow( flow ) ||
		isNewHostedSiteCreationFlow( flow ) ||
		isSiteAssemblerFlow( flow ) ||
		isReadymadeFlow( flow ) ||
		wooFlows.includes( flow || '' )
	) {
		siteVisibility = Site.Visibility.PublicNotIndexed;
	}

	const signupDestinationCookieExists = retrieveSignupDestination();
	const isReEnteringFlow = getSignupCompleteFlowName() === flow;
	//User has already reached checkout and then hit the browser back button.
	//In this case, site has already been created, and plan added to cart. We need to avoid to create another site.
	const isManageSiteFlow = Boolean(
		wasSignupCheckoutPageUnloaded() && signupDestinationCookieExists && isReEnteringFlow
	);
	const { addTempSiteToSourceOption } = useAddTempSiteToSourceOptionMutation();
	const urlQueryParams = useQuery();
	const sourceSiteSlug = urlQueryParams.get( 'from' ) || '';
	const { data: sourceMigrationStatus } = useSourceMigrationStatusQuery( sourceSiteSlug );
	const useThemeHeadstart =
		! isStartWritingFlow( flow ) &&
		! isNewHostedSiteCreationFlow( flow ) &&
		! isSiteAssemblerFlow( flow ) &&
		! isMigrationSignupFlow( flow );

	async function createSite() {
		if ( isManageSiteFlow ) {
			return {
				siteSlug: getSignupCompleteSlug(),
				goToCheckout: true,
				siteCreated: true,
			};
		}

		const sourceSlug = hasSourceSlug( data ) ? data.sourceSlug : undefined;
		const site = await createSiteWithCart(
			flow,
			true,
			isPaidDomainItem,
			theme,
			siteVisibility,
			urlData?.meta.title ?? selectedSiteTitle,
			// We removed the color option during newsletter onboarding.
			// But backend still expects/needs a value, so supplying the default.
			// Ideally should remove this and update code downstream to handle this.
			'#113AF5',
			useThemeHeadstart,
			username,
			domainItem,
			domainCartItem,
			sourceSlug
		);

		if ( preselectedThemeSlug && site?.siteSlug ) {
			await setThemeOnSite( site.siteSlug, preselectedThemeSlug, preselectedThemeStyleVariation );
		}

		if ( isEntrepreneurFlow( flow ) && site ) {
			await addEcommerceTrial( { siteId: site.siteId } );

			return {
				siteId: site.siteId,
				siteSlug: site.siteSlug,
				goToCheckout: false,
				siteCreated: true,
			};
		}

		if ( planCartItem && site?.siteSlug ) {
			await addPlanToCart( site.siteSlug, flow, true, theme, planCartItem );
		}

		if ( productCartItems?.length && site?.siteSlug ) {
			await addProductsToCart( site.siteSlug, flow, productCartItems );
		}

		if ( isImportFocusedFlow( flow ) && site?.siteSlug && sourceMigrationStatus?.source_blog_id ) {
			// Store temporary target blog id to source site option
			addTempSiteToSourceOption( site.siteId, sourceMigrationStatus?.source_blog_id );
		}

		return {
			siteId: site?.siteId,
			siteSlug: site?.siteSlug,
			goToCheckout: Boolean( planCartItem ),
			hasSetPreselectedTheme: Boolean( preselectedThemeSlug ),
			siteCreated: true,
		};
	}

	useEffect( () => {
		if ( ! isFreeFlow( flow ) ) {
			setProgress( 0.1 );
		}
		if ( submit ) {
			setPendingAction( createSite );
			submit();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const getCurrentMessage = () => {
		return isWooExpressFlow( flow )
			? __( "Woo! We're creating your store" )
			: __( 'Creating your site' );
	};

	const getSubTitle = () => {
		if ( isWooExpressFlow( flow ) ) {
			return __(
				'#FunWooFact: Did you know that Woo powers almost 4 million stores worldwide? You’re in good company.'
			);
		}
		return null;
	};

	const subTitle = getSubTitle();

	return (
		<>
			<DocumentHead title={ getCurrentMessage() } />
			<StepContainer
				shouldHideNavButtons
				hideFormattedHeader
				stepName="create-site"
				isHorizontalLayout
				recordTracksEvent={ recordTracksEvent }
				stepContent={
					<>
						<h1>{ getCurrentMessage() }</h1>
						{ progress >= 0 || isWooExpressFlow( flow ) ? (
							<LoadingBar progress={ progress } />
						) : (
							<LoadingEllipsis />
						) }
						{ subTitle && <p className="processing-step__subtitle">{ subTitle }</p> }
					</>
				}
				showFooterWooCommercePowered={ false }
			/>
		</>
	);
};

export default CreateSite;
