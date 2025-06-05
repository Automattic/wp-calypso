import { SiteIntent } from '@automattic/data-stores/src/onboard';
import { Step } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import Loading from 'calypso/components/loading';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { useMarketplaceThemeProducts } from '../../../../hooks/use-marketplace-theme-products';
import { useSiteData } from '../../../../hooks/use-site-data';
import { useSiteTransferStatusQuery } from '../../../../hooks/use-site-transfer/query';
import { useWaitForAtomic } from '../../../../hooks/use-wait-for-atomic';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import type { Step as StepType } from '../../types';
import type { OnboardSelect, SiteSelect } from '@automattic/data-stores';

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

const PostCheckoutOnboarding: StepType = ( { flow, navigation } ) => {
	const { submit } = navigation;
	const { setPendingAction } = useDispatch( ONBOARD_STORE );
	const { site, siteSlug } = useSiteData();

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

	const isJetpack = useSelect(
		( select ) => site && ( select( SITE_STORE ) as SiteSelect ).isJetpackSite( site.ID ),
		[ site ]
	);

	const isAtomic = useSelect(
		( select ) => site && ( select( SITE_STORE ) as SiteSelect ).isSiteAtomic( site.ID ),
		[ site ]
	);

	const isJetpackOrAtomic = isJetpack || isAtomic;

	const {
		isLoading: isLoadingMarketplaceThemeProducts,
		isMarketplaceThemeSubscribed,
		isExternallyManagedThemeAvailable,
	} = useMarketplaceThemeProducts();

	const { data: siteTransferStatusData, isLoading: isLoadingSiteTransferStatusData } =
		useSiteTransferStatusQuery( site?.ID );

	const { waitForInitiateTransfer, waitForTransfer, waitForFeature, waitForLatestSiteData } =
		useWaitForAtomic( {} );

	const { setIntentOnSite, setGoalsOnSite } = useDispatch( SITE_STORE );

	const waitForAtomic = async () => {
		await waitForTransfer();
		await setIntentOnSite( siteSlug, intent );
		await setGoalsOnSite( siteSlug, goals );
		await waitForFeature();
		await waitForLatestSiteData();
	};

	const pluginByGoal = usePluginByGoal();
	const hasPluginByGoal = !! pluginByGoal;

	/**
	 * If an externally managed theme is selected, we need to check the following:
	 * - Ensure the theme is available. If it's not, we do nothing, as the user may remove the theme product during checkout.
	 * - Verify that the site is atomic, as the theme should be installed on the user's site.
	 *
	 * The atomic transfer will be initiated immediately after the user purchases an externally managed theme.
	 * If it’s not initiated, we need to trigger the atomic transfer manually.
	 *
	 * Note that an externally managed theme is only available when both of the following conditions are met:
	 * - The site must be subscribed to the theme.
	 * - The site must be eligible for managed external themes.
	 */
	const hasExternalTheme =
		selectedDesign?.is_externally_managed &&
		isMarketplaceThemeSubscribed &&
		isExternallyManagedThemeAvailable;

	useEffect( () => {
		if (
			! site ||
			! siteSlug ||
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
			};

			if ( isJetpackOrAtomic ) {
				return providedDependencies;
			}

			if ( siteTransferStatusData?.isTransferring ) {
				await waitForAtomic();
			} else if ( hasExternalTheme || hasPluginByGoal ) {
				await waitForInitiateTransfer( pluginByGoal );
				await waitForAtomic();
			}

			return providedDependencies;
		} );

		submit?.( {
			siteId: site.ID,
			siteSlug,
		} );
	}, [
		site,
		siteSlug,
		isLoadingMarketplaceThemeProducts,
		isLoadingSiteTransferStatusData,
		isJetpackOrAtomic,
		siteTransferStatusData,
		selectedDesign,
		isMarketplaceThemeSubscribed,
		isExternallyManagedThemeAvailable,
		hasPluginByGoal,
	] );

	if ( shouldUseStepContainerV2( flow ) ) {
		return <Step.Loading />;
	}

	return <Loading className="wpcom-loading__boot" />;
};

export default PostCheckoutOnboarding;
