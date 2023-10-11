import { PLAN_HOSTING_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { Site } from '@automattic/data-stores';
import {
	ECOMMERCE_FLOW,
	StepContainer,
	WOOEXPRESS_FLOW,
	addPlanToCart,
	addProductsToCart,
	createSiteWithCart,
	isCopySiteFlow,
	isFreeFlow,
	isLinkInBioFlow,
	isMigrationFlow,
	isStartWritingFlow,
	isWooExpressFlow,
	isNewHostedSiteCreationFlow,
	isNewsletterFlow,
	isBlogOnboardingFlow,
	isOnboardingPMFlow,
} from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingBar } from 'calypso/components/loading-bar';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import useAddHostingTrialMutation from 'calypso/data/hosting/use-add-hosting-trial-mutation';
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
const DEFAULT_NEWSLETTER_THEME = 'pub/lettre';
const DEFAULT_START_WRITING_THEME = 'pub/hey';

function hasSourceSlug( data: unknown ): data is { sourceSlug: string } {
	if ( data && ( data as { sourceSlug: string } ).sourceSlug ) {
		return true;
	}
	return false;
}

const SiteCreationStep: Step = function SiteCreationStep( { navigation, flow, data } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const stepProgress = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getStepProgress(),
		[]
	);

	const { mutateAsync: addHostingTrial } = useAddHostingTrialMutation();

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

	const username = useSelector( ( state ) => getCurrentUserName( state ) );

	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	// when it's empty, the default WordPress theme will be used.
	let theme = '';
	if ( isMigrationFlow( flow ) || isCopySiteFlow( flow ) ) {
		theme = DEFAULT_SITE_MIGRATION_THEME;
	} else if ( isWooExpressFlow( flow ) ) {
		theme = DEFAULT_WOOEXPRESS_FLOW;
	} else if ( isStartWritingFlow( flow ) ) {
		theme = DEFAULT_START_WRITING_THEME;
	} else if ( isLinkInBioFlow( flow ) ) {
		theme = DEFAULT_LINK_IN_BIO_THEME;
	} else if ( isNewsletterFlow( flow ) ) {
		theme = DEFAULT_NEWSLETTER_THEME;
	}
	const isPaidDomainItem = Boolean( domainCartItem?.product_slug );

	const progress = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getProgress(),
		[]
	);
	const { setProgress } = useDispatch( ONBOARD_STORE );

	// Default visibility is public
	let siteVisibility = Site.Visibility.PublicIndexed;
	const wooFlows = [ ECOMMERCE_FLOW, WOOEXPRESS_FLOW ];

	// These flows default to "Coming Soon"
	if (
		isCopySiteFlow( flow ) ||
		isFreeFlow( flow ) ||
		isLinkInBioFlow( flow ) ||
		isMigrationFlow( flow ) ||
		isBlogOnboardingFlow( flow ) ||
		isNewHostedSiteCreationFlow( flow ) ||
		isOnboardingPMFlow( flow ) ||
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
	const useThemeHeadstart = ! isStartWritingFlow( flow ) && ! isNewHostedSiteCreationFlow( flow );

	async function createSite() {
		if ( isManageSiteFlow ) {
			return {
				siteSlug: getSignupCompleteSlug(),
				goToCheckout: true,
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

		if ( planCartItem?.product_slug === PLAN_HOSTING_TRIAL_MONTHLY && site ) {
			await addHostingTrial( { siteId: site.siteId, planSlug: PLAN_HOSTING_TRIAL_MONTHLY } );

			return {
				siteId: site.siteId,
				siteSlug: site.siteSlug,
				goToCheckout: false,
			};
		}

		if ( planCartItem && site?.siteSlug ) {
			await addPlanToCart( site.siteSlug, flow, true, theme, planCartItem );
		}

		if ( productCartItems?.length && site?.siteSlug ) {
			await addProductsToCart( site.siteSlug, flow, productCartItems );
		}

		if ( isMigrationFlow( flow ) && site?.siteSlug && sourceMigrationStatus?.source_blog_id ) {
			// Store temporary target blog id to source site option
			addTempSiteToSourceOption( site.siteId, sourceMigrationStatus?.source_blog_id );
		}

		return {
			siteId: site?.siteId,
			siteSlug: site?.siteSlug,
			goToCheckout: Boolean( planCartItem ),
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
						{ subTitle && <p className="processing-step__subtitle">{ subTitle }</p> }
					</>
				}
				stepProgress={ stepProgress }
				showFooterWooCommercePowered={ false }
			/>
		</>
	);
};

export default SiteCreationStep;
