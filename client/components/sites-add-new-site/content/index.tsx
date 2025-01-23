import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { WordPressLogo, JetpackLogo } from '@automattic/components';
import { download, reusableBlock, Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
// TODO: This will need to be updated to use whatever image we decide on.
import devSiteBanner from 'calypso/assets/images/a8c-for-agencies/dev-site-banner.svg';
import { preventWidows } from 'calypso/lib/formatting';
import { TRACK_SOURCE_NAME } from 'calypso/sites-dashboard/utils';
import { Column } from './layout/column';
import { MenuItem } from './layout/menu-item';

export const Content = () => {
	const translate = useTranslate();

	return (
		<>
			<Column heading={ translate( 'Add a new site' ) }>
				<MenuItem
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
				<MenuItem
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
			</Column>
			<Column heading={ translate( 'Migrate & Import' ) }>
				<MenuItem
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
				<MenuItem
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
			</Column>
			<Column>
				<MenuItem
					isBanner
					icon={ <img src={ devSiteBanner } alt="Get a Free Domain and Up to 55% off" /> }
					heading={ translate( 'Get a Free Domain and Up to 55% off' ) }
					description={ preventWidows(
						translate(
							'Save up to 55% on annual plans and get a free custom domain for a year. Your next site is just a step away.'
						)
					) }
					buttonProps={ {
						onClick: () => {
							recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_offer' );
							window.location.href = 'https://wordpress.com/pricing/';
						},
					} }
				>
					<div>
						<div className={ clsx( 'sites-add-new-site-popover__cta' ) }>
							{ translate( 'Unlock Offer' ) }
						</div>
					</div>
				</MenuItem>
			</Column>
		</>
	);
};

export default Content;
