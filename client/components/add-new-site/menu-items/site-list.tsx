import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { WordPressLogo, JetpackLogo } from '@automattic/components';
import { download, reusableBlock, Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useFetchDevLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-dev-licenses';
import usePressableOwnershipType from 'calypso/a8c-for-agencies/sections/marketplace/hosting-overview/hooks/use-pressable-ownership-type';
// TODO: This will need to be updated to use whatever image we decide on.
import devSiteBanner from 'calypso/assets/images/a8c-for-agencies/dev-site-banner.svg';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import AddNewSiteMenuItem from 'calypso/components/add-new-site/menu-item';
import AddNewSitePopoverColumn from 'calypso/components/add-new-site/popover-column';
import { preventWidows } from 'calypso/lib/formatting';
import { TRACK_SOURCE_NAME } from 'calypso/sites-dashboard/utils';

const AddNewSiteSiteListMenuItems = () => {
	const translate = useTranslate();

	const pressableOwnership = usePressableOwnershipType();

	const { data: devLicenses } = useFetchDevLicenses();

	const hasAvailableDevSites = devLicenses?.available > 0;

	const devSitesEnabled = config.isEnabled( 'a4a-dev-sites' );

	return (
		<>
			<AddNewSitePopoverColumn heading={ translate( 'Add a new site' ) }>
				<AddNewSiteMenuItem
					icon={ <WordPressLogo /> }
					heading={ translate( 'WordPress.com' ) }
					description={ preventWidows(
						translate( 'Build and grow your site, all in one powerful platform.' )
					) }
					buttonProps={ {
						onClick: () => {
							recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_wordpress' );
							page( '/start?source=sites-dashboard&ref=topbar' );
						},
					} }
				/>
				<AddNewSiteMenuItem
					icon={ <JetpackLogo /> }
					heading={ translate( 'Via the Jetpack plugin' ) }
					description={ preventWidows(
						translate( 'Install the Jetpack plugin on an existing site' )
					) }
					buttonProps={ {
						onClick: () => {
							recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_jetpack' );
							page( `/jetpack/connect?cta_from=${ TRACK_SOURCE_NAME }&cta_id=add-site` );
						},
					} }
				/>
				<AddNewSiteMenuItem
					icon={ <img src={ pressableIcon } alt="Pressable" /> }
					heading="Pressable"
					description={ translate( 'Bring your theme, plugins, and content to WordPress.com.' ) }
					buttonProps={ {
						href:
							pressableOwnership === 'regular'
								? 'https://my.pressable.com/agency/auth'
								: A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
						target: pressableOwnership === 'regular' ? '_blank' : undefined,
					} }
				/>
			</AddNewSitePopoverColumn>
			<AddNewSitePopoverColumn heading={ translate( 'Migrate & Import' ) }>
				<AddNewSiteMenuItem
					icon={ <Icon icon={ reusableBlock } size={ 18 } /> }
					heading="Migrate"
					description={ preventWidows(
						translate( 'Bring your theme, plugins, and content to WordPress.com.' )
					) }
					buttonProps={ {
						onClick: () => {
							recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_migrate' );
							page(
								'/setup/hosted-site-migration/site-migration-identify?source=sites-dashboard&ref=topbar&action=migrate'
							);
						},
					} }
				/>
				<AddNewSiteMenuItem
					icon={ <Icon icon={ download } size={ 18 } /> }
					heading="Import"
					description={ preventWidows(
						translate( 'Use a backup file to import your content into a new site.' )
					) }
					buttonProps={ {
						onClick: () => {
							recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_import' );
							page(
								'/setup/hosted-site-migration/site-migration-identify?source=sites-dashboard&ref=topbar&action=import'
							);
						},
					} }
				/>
			</AddNewSitePopoverColumn>
			{ devSitesEnabled && (
				<AddNewSitePopoverColumn>
					<AddNewSiteMenuItem
						isBanner
						icon={ <img src={ devSiteBanner } alt="Get a Free Domain and Up to 55% off" /> }
						heading={ translate( 'Get a Free Domain and Up to 55% off' ) }
						description={ preventWidows(
							translate(
								'Save up to 55% on annual plans and get a free custom domain for a year. Your next site is just a step away.'
							)
						) }
						disabled={ ! hasAvailableDevSites }
						buttonProps={ {
							onClick: () => {
								// TODO
							},
						} }
					>
						<div>
							<div
								className={ clsx( 'add-new-site-popover__cta', {
									disabled: ! hasAvailableDevSites,
								} ) }
							>
								{ translate( 'Unlock Offer' ) }
							</div>
						</div>
					</AddNewSiteMenuItem>
				</AddNewSitePopoverColumn>
			) }
		</>
	);
};

export default AddNewSiteSiteListMenuItems;
