import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutColumn from 'calypso/a8c-for-agencies/components/layout/column';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_SITES_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useCreateWPCOMSiteMutation from 'calypso/a8c-for-agencies/data/sites/use-create-wpcom-site';
import useFetchPendingSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites';
import SitesHeaderActions from '../sites-header-actions';
import ClientSite from './client-site';
import { AvailablePlans } from './plan-field';
import PurchaseConfirmationMessage from './purchase-confirmation-message';
import SiteConfigurationsModal from './site-configurations-modal';
import { useRandomSiteName } from './site-configurations-modal/use-random-site-name';
import NeedSetupTable from './table';
import type { ReferralAPIResponse } from '../../referrals/types';

type Props = {
	licenseKey?: string;
};

type NeedsSetupSite = {
	features: {
		wpcom_atomic: {
			license_key: string;
			state: string;
			referral: ReferralAPIResponse;
		};
	};
	id: number;
};

const isA4aSiteCreationConfigurationsEnabled = config.isEnabled(
	'a4a-site-creation-configurations'
);

export default function NeedSetup( { licenseKey }: Props ) {
	const { randomSiteName, isRandomSiteNameLoading } = useRandomSiteName();
	const translate = useTranslate();
	const [ currentSiteConfigurationId, setCurrentSiteConfigurationId ] = useState< number | null >(
		null
	);

	const closeModal = () => setCurrentSiteConfigurationId( null );

	const isAutomatedReferralsEnabled = config.isEnabled( 'a4a-automated-referrals' );

	const title = translate( 'Sites' );

	const { data: pendingSites, isFetching, refetch: refetchPendingSites } = useFetchPendingSites();

	const { mutate: createWPCOMSite, isPending: isCreatingSite } = useCreateWPCOMSiteMutation();

	const allAvailableSites =
		pendingSites?.filter(
			( { features }: NeedsSetupSite ) =>
				features.wpcom_atomic.state === 'pending' && !! features.wpcom_atomic.license_key
		) ?? [];

	// Filter out sites that have a referral
	const availableSites =
		allAvailableSites.filter( ( { features }: NeedsSetupSite ) =>
			isAutomatedReferralsEnabled ? ! features.wpcom_atomic.referral : true
		) ?? [];

	// Find the site license by license key
	const foundSiteLicenseByLicenseKey = pendingSites?.find(
		( { features }: NeedsSetupSite ) => features.wpcom_atomic.license_key === licenseKey
	);

	const hasReferral =
		isAutomatedReferralsEnabled && !! foundSiteLicenseByLicenseKey?.features.wpcom_atomic.referral;

	// Filter out the site license we found by license key
	const otherReferralSites = isAutomatedReferralsEnabled
		? allAvailableSites.filter(
				( { features }: NeedsSetupSite ) =>
					!! features.wpcom_atomic.referral &&
					( hasReferral ? features.wpcom_atomic.license_key !== licenseKey : true )
		  )
		: [];

	const availablePlans: AvailablePlans[] = [
		// If the site license we found by license key has a referral, we should show it first
		...( hasReferral
			? [
					{
						name: translate( 'WordPress.com' ),
						available: 1,
						subTitle: (
							<ClientSite
								referral={ foundSiteLicenseByLicenseKey.features.wpcom_atomic.referral }
							/>
						),
						ids: [ foundSiteLicenseByLicenseKey.id ],
					},
			  ]
			: [] ),
		// If there are other referral sites, we should show them next
		...( otherReferralSites.length
			? otherReferralSites.map( ( { features, id }: NeedsSetupSite ) => ( {
					name: translate( 'WordPress.com' ),
					available: 1,
					subTitle: <ClientSite referral={ features.wpcom_atomic.referral } />,
					ids: [ id ],
			  } ) )
			: [] ),
		...( availableSites.length
			? [
					{
						name: translate( 'WordPress.com' ),
						subTitle: translate( '%(count)d site available', '%(count)d sites available', {
							args: {
								count: availableSites.length,
							},
							count: availableSites.length,
							comment: 'The `count` is the number of available sites.',
						} ),
						ids: availableSites.map( ( { id }: { id: number } ) => id ),
					},
			  ]
			: [] ),
	];

	const isProvisioning =
		isCreatingSite ||
		pendingSites?.find(
			( { features }: { features: { wpcom_atomic: { state: string; license_key: string } } } ) =>
				features.wpcom_atomic.state === 'provisioning' && !! features.wpcom_atomic.license_key
		);

	const onCreateSiteSuccess = useCallback(
		( id: number ) => {
			refetchPendingSites();
			page( addQueryArgs( A4A_SITES_LINK, { created_site: id } ) );
		},
		[ refetchPendingSites ]
	);

	const onCreateSite = useCallback(
		( id: number ) => {
			createWPCOMSite(
				{ id },
				{
					onSuccess: () => onCreateSiteSuccess( id ),
				}
			);
		},
		[ createWPCOMSite, onCreateSiteSuccess ]
	);

	const onMigrateSite = useCallback(
		( id: number ) => {
			createWPCOMSite(
				{ id },
				{
					onSuccess: () => {
						refetchPendingSites();
						page( addQueryArgs( A4A_SITES_LINK, { created_site: id, migration: true } ) );
					},
				}
			);
		},
		[ createWPCOMSite, refetchPendingSites ]
	);

	return (
		<Layout
			className={ clsx(
				'sites-dashboard sites-dashboard__layout is-without-filters preview-hidden',
				{
					'has-product-referral': !! otherReferralSites.length || hasReferral,
				}
			) }
			wide
			title={ title }
		>
			<LayoutColumn className="sites-overview" wide>
				<LayoutTop>
					<PurchaseConfirmationMessage />

					<LayoutHeader>
						<Title>{ translate( 'Sites' ) }</Title>
						<Actions>
							<MobileSidebarNavigation />
							<SitesHeaderActions />
						</Actions>
					</LayoutHeader>
				</LayoutTop>
				{ currentSiteConfigurationId && (
					<SiteConfigurationsModal
						closeModal={ closeModal }
						randomSiteName={ randomSiteName }
						isRandomSiteNameLoading={ isRandomSiteNameLoading }
						siteId={ currentSiteConfigurationId }
						onCreateSiteSuccess={ onCreateSiteSuccess }
					/>
				) }
				<NeedSetupTable
					availablePlans={ availablePlans }
					isLoading={ isFetching }
					provisioning={ isProvisioning }
					onCreateSite={
						isA4aSiteCreationConfigurationsEnabled ? setCurrentSiteConfigurationId : onCreateSite
					}
					onMigrateSite={ onMigrateSite }
				/>
			</LayoutColumn>
		</Layout>
	);
}
