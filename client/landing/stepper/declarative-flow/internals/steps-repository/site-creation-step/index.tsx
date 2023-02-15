import { Site } from '@automattic/data-stores';
import {
	ECOMMERCE_FLOW,
	WOOEXPRESS_FLOW,
	isLinkInBioFlow,
	addPlanToCart,
	createSiteWithCart,
	isFreeFlow,
	isMigrationFlow,
	isCopySiteFlow,
	isWooExpressFlow,
	StepContainer,
	addProductsToCart,
} from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingBar } from 'calypso/components/loading-bar';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import useAddTempSiteToSourceOptionMutation from 'calypso/data/site-migration/use-add-temp-site-mutation';
import { useSiteQuery } from 'calypso/data/sites/use-site-query';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	retrieveSignupDestination,
	getSignupCompleteFlowName,
	wasSignupCheckoutPageUnloaded,
	getSignupCompleteSlug,
} from 'calypso/signup/storageUtils';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import type { Step } from '../../types';

import './styles.scss';

const DEFAULT_WP_SITE_THEME = 'pub/zoologist';
const DEFAULT_LINK_IN_BIO_THEME = 'pub/lynx';
const DEFAULT_WOOEXPRESS_FLOW = 'pub/twentytwentytwo';
const DEFAULT_NEWSLETTER_THEME = 'pub/lettre';

const SiteCreationStep: Step = function SiteCreationStep( { navigation, flow, data } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const stepProgress = useSelect( ( select ) => select( ONBOARD_STORE ).getStepProgress() );

	const { domainCartItem, planCartItem, siteAccentColor, getSelectedSiteTitle, productCartItems } =
		useSelect( ( select ) => ( {
			domainCartItem: select( ONBOARD_STORE ).getDomainCartItem(),
			siteAccentColor: select( ONBOARD_STORE ).getSelectedSiteAccentColor(),
			planCartItem: select( ONBOARD_STORE ).getPlanCartItem(),
			productCartItems: select( ONBOARD_STORE ).getProductCartItems(),
			getSelectedSiteTitle: select( ONBOARD_STORE ).getSelectedSiteTitle(),
		} ) );

	const username = useSelector( ( state ) => getCurrentUserName( state ) );

	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	let theme: string;
	if ( isMigrationFlow( flow ) || isCopySiteFlow( flow ) ) {
		theme = DEFAULT_WP_SITE_THEME;
	} else if ( isWooExpressFlow( flow ) ) {
		theme = DEFAULT_WOOEXPRESS_FLOW;
	} else {
		theme = isLinkInBioFlow( flow ) ? DEFAULT_LINK_IN_BIO_THEME : DEFAULT_NEWSLETTER_THEME;
	}
	const isPaidDomainItem = Boolean( domainCartItem?.product_slug );

	const progress = useSelect( ( select ) => select( ONBOARD_STORE ).getProgress() );
	const { setProgress } = useDispatch( ONBOARD_STORE );

	// Default visibility is public
	let siteVisibility = Site.Visibility.PublicIndexed;
	const wooFlows = [ ECOMMERCE_FLOW, WOOEXPRESS_FLOW ];

	// These flows default to "Coming Soon"
	if (
		isLinkInBioFlow( flow ) ||
		isFreeFlow( flow ) ||
		isMigrationFlow( flow ) ||
		isCopySiteFlow( flow ) ||
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
	const blogTitle = isFreeFlow( 'free' ) ? getSelectedSiteTitle : '';
	const { addTempSiteToSourceOption } = useAddTempSiteToSourceOptionMutation();
	const search = window.location.search;
	const sourceSiteSlug = new URLSearchParams( search ).get( 'from' ) || '';
	const { data: siteData } = useSiteQuery( sourceSiteSlug, isCopySiteFlow( flow ) );

	async function createSite() {
		if ( isManageSiteFlow ) {
			return {
				siteSlug: getSignupCompleteSlug(),
				goToCheckout: true,
			};
		}

		const site = await createSiteWithCart(
			flow as string,
			true,
			isPaidDomainItem,
			theme,
			siteVisibility,
			blogTitle,
			siteAccentColor,
			true,
			username,
			domainCartItem,
			data?.sourceSlug as string
		);

		if ( planCartItem ) {
			await addPlanToCart( site?.siteSlug as string, flow as string, true, theme, planCartItem );
		}

		if ( productCartItems?.length ) {
			await addProductsToCart( site?.siteSlug as string, flow as string, productCartItems );
		}

		if ( isMigrationFlow( flow ) ) {
			// Store temporary target blog id to source site option
			addTempSiteToSourceOption( site?.siteId as number, siteData?.ID as number );
		}

		return {
			siteSlug: site?.siteSlug,
			goToCheckout: Boolean( planCartItem ),
		};
	}

	useEffect( () => {
		setProgress( 0.1 );
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

	return (
		<>
			<DocumentHead title={ getCurrentMessage() } />
			<StepContainer
				shouldHideNavButtons={ true }
				hideFormattedHeader={ true }
				stepName="site-creation-step"
				isHorizontalLayout={ true }
				recordTracksEvent={ recordTracksEvent }
				stepContent={
					<>
						<h1>{ getCurrentMessage() }</h1>
						{ progress >= 0 || isWooExpressFlow( flow ) ? (
							<LoadingBar progress={ progress } />
						) : (
							<LoadingEllipsis />
						) }
					</>
				}
				stepProgress={ stepProgress }
				showFooterWooCommercePowered={ false }
			/>
		</>
	);
};

export default SiteCreationStep;
