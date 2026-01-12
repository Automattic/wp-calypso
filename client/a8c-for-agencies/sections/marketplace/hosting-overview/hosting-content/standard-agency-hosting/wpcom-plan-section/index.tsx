import { arrowRight } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useMemo, useState } from 'react';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
import SiteConfigurationsModal from 'calypso/a8c-for-agencies/components/site-configurations-modal';
import { useRandomSiteName } from 'calypso/a8c-for-agencies/components/site-configurations-modal/use-random-site-name';
import useFetchDevLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-dev-licenses';
import useSiteCreatedCallback from 'calypso/a8c-for-agencies/hooks/use-site-created-callback';
import useWPCOMOwnedSites from 'calypso/a8c-for-agencies/hooks/use-wpcom-owned-sites';
import { MarketplaceTypeContext } from 'calypso/a8c-for-agencies/sections/marketplace/context';
import useProductAndPlans from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-product-and-plans';
import { getWPCOMCreatorPlan } from 'calypso/a8c-for-agencies/sections/marketplace/lib/hosting';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import HostingPlanSection from '../../common/hosting-plan-section';
import WPCOMPlanSlider from '../wpcom-plan-selector/slider';
import WPCOMPlanSelector from './wpcom-plan-selector';

import './style.scss';

const MAX_PLANS_FOR_SLIDER = 10;

type Props = {
	onSelect: ( plan: APIProductFamilyProduct, quantity: number ) => void;
};

export default function WPCOMPlanSection( { onSelect }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { data: devLicenses } = useFetchDevLicenses();

	const availableDevSites = devLicenses?.available;

	const [ showWPCOMDevSiteConfigurationsModal, setShowWPCOMDevSiteConfigurationsModal ] =
		useState( false );

	const { randomSiteName, isRandomSiteNameLoading, refetchRandomSiteName } = useRandomSiteName();

	const onCreateSiteSuccess = useSiteCreatedCallback( refetchRandomSiteName );

	const onHideWPCOMDevSiteConfigurationsModal = useCallback( () => {
		setShowWPCOMDevSiteConfigurationsModal( false );
	}, [ setShowWPCOMDevSiteConfigurationsModal ] );

	const onClickCreateWPCOMDevSite = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_hosting_page_create_wpcom_dev_site_click' ) );
		setShowWPCOMDevSiteConfigurationsModal( true );
	}, [ dispatch, setShowWPCOMDevSiteConfigurationsModal ] );

	const { count, isReady: isLicenseCountsReady } = useWPCOMOwnedSites();

	const { wpcomPlans } = useProductAndPlans( {} );

	const plan = getWPCOMCreatorPlan( wpcomPlans ) ?? wpcomPlans[ 0 ];

	const { marketplaceType } = useContext( MarketplaceTypeContext );
	const isReferralMode = marketplaceType === 'referral';

	const ownedPlans = useMemo( () => {
		if ( isReferralMode ) {
			return 0;
		}

		return count;
	}, [ count, isReferralMode ] );

	const [ quantity, setQuantity ] = useState( 1 );

	if ( ! plan ) {
		return;
	}

	// Show the WPCOM slider if the user has less than 10 plans and is not in referral mode.
	const showWPCOMSlider = ! isReferralMode && ownedPlans < MAX_PLANS_FOR_SLIDER;

	const displayQuantity = isReferralMode ? 1 : quantity;

	return (
		<>
			<HostingPlanSection
				className="wpcom-plan-section"
				heading={
					isReferralMode
						? translate( 'Refer a WordPress.com site to your client' )
						: translate( 'Purchase sites individually or in bulk, as you need them' )
				}
			>
				{ showWPCOMSlider && (
					<HostingPlanSection.Banner>
						<WPCOMPlanSlider
							quantity={ displayQuantity }
							onChange={ setQuantity }
							ownedPlans={ ownedPlans }
						/>
					</HostingPlanSection.Banner>
				) }

				<HostingPlanSection.Card>
					{ isLicenseCountsReady ? (
						<WPCOMPlanSelector
							plan={ plan }
							onSelect={ onSelect }
							ownedPlans={ ownedPlans }
							isReferralMode={ isReferralMode }
							quantity={ displayQuantity }
							setQuantity={ setQuantity }
						/>
					) : (
						<WPCOMPlanSelector.Placeholder />
					) }
				</HostingPlanSection.Card>

				<HostingPlanSection.Details
					heading={ translate(
						'%(quantity)s WordPress.com site',
						'%(quantity)s WordPress.com sites',
						{
							args: {
								quantity: displayQuantity,
							},
							count: displayQuantity,
							comment: '%(quantity)s is the number of WordPress.com sites.',
						}
					) }
				>
					<p>
						{ translate(
							'Enjoy cumulative volume discounts on WordPress.com site purchases, regardless of when you buy. Every site includes:'
						) }
					</p>

					<SimpleList
						items={ [
							translate( '{{b}}50GB{{/b}} of storage', { components: { b: <b /> } } ),
							translate( '{{b}}Free{{/b}} staging site', { components: { b: <b /> } } ),
							translate( '{{b}}Unrestricted bandwidth{{/b}}', { components: { b: <b /> } } ),
							translate( '{{b}}Everything listed below{{/b}}', { components: { b: <b /> } } ),
						] }
					/>
				</HostingPlanSection.Details>

				<HostingPlanSection.Aside
					heading={ translate( 'Start building for free' ) }
					cta={ {
						label: translate( 'Create a development site' ),
						variant: 'secondary',
						icon: arrowRight,
						disabled: ! availableDevSites,
						onClick: onClickCreateWPCOMDevSite,
					} }
				>
					<p>
						{ translate(
							'Included in your membership to Automattic for Agencies. Develop up to 5 WordPress.com sites with free development licenses. Only pay when you launch.'
						) }
					</p>

					<i>
						{ translate( '%(pendingSites)d of 5 free licenses available', {
							args: {
								pendingSites: availableDevSites,
							},
							comment: '%(pendingSites)s is the number of free licenses available.',
						} ) }
					</i>
				</HostingPlanSection.Aside>
			</HostingPlanSection>

			{ showWPCOMDevSiteConfigurationsModal && (
				<SiteConfigurationsModal
					closeModal={ onHideWPCOMDevSiteConfigurationsModal }
					randomSiteName={ randomSiteName }
					isRandomSiteNameLoading={ isRandomSiteNameLoading }
					onCreateSiteSuccess={ onCreateSiteSuccess }
				/>
			) }
		</>
	);
}
