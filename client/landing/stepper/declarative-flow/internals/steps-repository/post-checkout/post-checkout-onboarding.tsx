import { siteBySlugQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import {
	FEATURE_BIG_SKY,
	isBusiness,
	isEcommerce,
	isPersonal,
	isPremium,
} from '@automattic/calypso-products';
import { SiteIntent } from '@automattic/data-stores/src/onboard';
import { Step } from '@automattic/onboarding';
import { useQuery } from '@tanstack/react-query';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import Loading from 'calypso/components/loading';
import { WOO_HOSTING_SOLUTIONS_REF } from 'calypso/landing/stepper/constants';
import { useQuery as useUrlParams } from 'calypso/landing/stepper/hooks/use-query';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { waitForPluginsActive } from 'calypso/landing/stepper/utils/wait-for-plugins-active';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useMarketplaceThemeProducts } from '../../../../hooks/use-marketplace-theme-products';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import { useSiteTransferStatusQuery } from '../../../../hooks/use-site-transfer/query';
import { useWaitForAtomic } from '../../../../hooks/use-wait-for-atomic';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import type { Step as StepType } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

const usePluginByGoal = () => {
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);

	if ( intent === SiteIntent.CreateCourseGoal ) {
		return 'sensei-lms';
	}

	return null;
};

const PostCheckoutOnboarding: StepType< {
	submits: {
		siteId: number;
		siteSlug: string;
		postCheckoutBigSky?: boolean;
	};
} > = ( { flow, navigation } ) => {
	const { __ } = useI18n();
	const { submit } = navigation;
	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	const siteSlug = useSiteSlugParam() ?? '';
	const {
		data: site,
		isLoading: isLoadingSite,
		isError: isErrorSite,
	} = useQuery( {
		...siteBySlugQuery( siteSlug ),
		enabled: !! siteSlug,
	} );

	const showBigSkyChoice =
		isEnabled( 'onboarding/post-checkout-ai-step' ) &&
		!! site?.plan &&
		( isPersonal( site.plan ) || isPremium( site.plan ) || isBusiness( site.plan ) ) &&
		site.plan.features?.active?.includes( FEATURE_BIG_SKY );

	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);

	const goals = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getGoals(),
		[]
	);

	const selectedDesign = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
		[]
	);

	const planCartItem = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
		[]
	);

	const isJetpackOrAtomic = !! site?.jetpack || !! site?.is_wpcom_atomic;

	const {
		isLoading: isLoadingMarketplaceThemeProducts,
		isError: isErrorMarketplaceThemeProducts,
		isMarketplaceThemeSubscribed,
		isExternallyManagedThemeAvailable,
	} = useMarketplaceThemeProducts( { siteId: site?.ID } );

	const {
		data: siteTransferStatusData,
		isLoading: isLoadingSiteTransferStatusData,
		isError: isErrorSiteTransferStatus,
	} = useSiteTransferStatusQuery( site?.ID );

	const { waitForInitiateTransfer, waitForTransfer, waitForFeature, waitForLatestSiteData } =
		useWaitForAtomic( { siteId: site?.ID } );

	const { setIntentOnSite, setGoalsOnSite } = useDispatch( SITE_STORE );

	const waitForAtomic = async () => {
		await waitForTransfer();
		await setIntentOnSite( siteSlug, intent );
		await setGoalsOnSite( siteSlug, goals );
		await waitForFeature();
		await waitForLatestSiteData();
	};

	const goalPlugin = usePluginByGoal();
	const hasPluginByGoal = !! goalPlugin;

	const refParameter = useUrlParams().get( 'ref' );
	const isWooHostingSolutions = refParameter === WOO_HOSTING_SOLUTIONS_REF;

	// Prefer the cart item (what the user just bought — freshest signal during
	// post-checkout) over site.plan (which can be stale before the site's plan
	// assignment syncs).
	const effectivePlan = planCartItem ?? site?.plan;
	const isCommercePlan = !! effectivePlan && isEcommerce( effectivePlan );

	// Woo-hosting-solutions ref:
	// - Commerce plans: the backend auto-provisions the Atomic transfer and
	//   installs WooCommerce, so we skip frontend initiation and only wait for
	//   readiness below.
	// - Business plans: must initiate an Atomic transfer with WooCommerce so
	//   the plugin gets installed as part of the transfer.
	const shouldInitiateWooTransfer = isWooHostingSolutions && ! isCommercePlan;
	const pluginToInstall = shouldInitiateWooTransfer ? 'woocommerce' : goalPlugin;
	const shouldInstallPlugin = Boolean( pluginToInstall );

	/**
	 * If an externally managed theme is selected, we need to check the following:
	 * - Ensure the theme is available. If it's not, we do nothing, as the user may remove the theme product during checkout.
	 * - Verify that the site is atomic, as the theme should be installed on the user's site.
	 *
	 * The atomic transfer will be initiated immediately after the user purchases an externally managed theme.
	 * If it's not initiated, we need to trigger the atomic transfer manually.
	 *
	 * Note that an externally managed theme is only available when both of the following conditions are met:
	 * - The site must be subscribed to the theme.
	 * - The site must be eligible for managed external themes.
	 */
	const hasExternalTheme =
		selectedDesign?.is_externally_managed &&
		isMarketplaceThemeSubscribed &&
		isExternallyManagedThemeAvailable;

	const hasError = isErrorSite || isErrorMarketplaceThemeProducts || isErrorSiteTransferStatus;

	useEffect( () => {
		if ( ! hasError ) {
			return;
		}
		recordTracksEvent( 'calypso_onboarding_post_checkout_setup_error', {
			flow,
			error_site: isErrorSite,
			error_marketplace_theme_products: isErrorMarketplaceThemeProducts,
			error_site_transfer_status: isErrorSiteTransferStatus,
		} );
	}, [ hasError, flow, isErrorSite, isErrorMarketplaceThemeProducts, isErrorSiteTransferStatus ] );

	useEffect( () => {
		if (
			hasError ||
			! site ||
			! siteSlug ||
			isLoadingSite ||
			isLoadingMarketplaceThemeProducts ||
			isLoadingSiteTransferStatusData
		) {
			return;
		}

		setPendingAction( async () => {
			const providedDependencies = {
				siteSlug,
				hasExternalTheme,
				hasPluginByGoal,
				...( showBigSkyChoice ? { postCheckoutBigSky: true } : {} ),
			};

			if ( ! isJetpackOrAtomic ) {
				if ( siteTransferStatusData?.isTransferring ) {
					await waitForAtomic();
				} else if ( hasExternalTheme || shouldInstallPlugin ) {
					await waitForInitiateTransfer( pluginToInstall );
					await waitForAtomic();
				}
			}

			// Poll for the Woo ref regardless of the atomic path above — the
			// site may already be Atomic when this effect mounts while
			// WooCommerce is still finishing installation. This covers both the
			// Commerce plan (backend auto-install) and the Business plan (install
			// via the transfer initiated above).
			if ( isWooHostingSolutions ) {
				await waitForPluginsActive( site.ID, [ 'woocommerce' ] );
			}

			return providedDependencies;
		} );

		submit?.( {
			siteId: site.ID,
			siteSlug,
		} );
	}, [
		hasError,
		site,
		siteSlug,
		isLoadingSite,
		isLoadingMarketplaceThemeProducts,
		isLoadingSiteTransferStatusData,
		isJetpackOrAtomic,
		siteTransferStatusData,
		selectedDesign,
		isMarketplaceThemeSubscribed,
		isExternallyManagedThemeAvailable,
		shouldInstallPlugin,
	] );

	if ( hasError ) {
		const heading = __( "We've hit a snag" );
		const body = __(
			'Something went wrong while setting up your site. Please try refreshing the page, or contact support if the problem persists.'
		);

		if ( shouldUseStepContainerV2( flow ) ) {
			return (
				<Step.CenteredColumnLayout
					columnWidth={ 8 }
					topBar={ <Step.TopBar /> }
					heading={ <Step.Heading text={ heading } /> }
				>
					{ body }
				</Step.CenteredColumnLayout>
			);
		}

		return <Loading className="wpcom-loading__boot" title={ heading } subtitle={ body } />;
	}

	if ( shouldUseStepContainerV2( flow ) ) {
		return <Step.Loading />;
	}

	return <Loading className="wpcom-loading__boot" />;
};

export default PostCheckoutOnboarding;
