import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { WordPressLogo, JetpackLogo } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { download, reusableBlock, Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
// TODO: This will need to be updated to use whatever image we decide on.
import devSiteBanner from 'calypso/assets/images/a8c-for-agencies/dev-site-banner.svg';
import { preventWidows } from 'calypso/lib/formatting';
import { TRACK_SOURCE_NAME } from 'calypso/sites-dashboard/utils';
import { Column } from './layout/column';
import { MenuItem } from './layout/menu-item';

const wordpressClick = () => {
	recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_add' );
	recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_item', {
		action: 'wordpress',
	} );
	page( '/start?source=sites-dashboard&ref=new-site-popover' );
};

const jetpackClick = () => {
	recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_jetpack' );
	recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_item', {
		action: 'jetpack',
	} );
	page( `/jetpack/connect?cta_from=${ TRACK_SOURCE_NAME }&cta_id=add-site` );
};

const migrateClick = () => {
	recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_item', {
		action: 'migrate',
	} );
	page(
		'/setup/hosted-site-migration/site-migration-identify?source=sites-dashboard&ref=new-site-popover&action=migrate'
	);
};

const importClick = () => {
	recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_import' );
	recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_item', {
		action: 'import',
	} );
	page(
		'/setup/hosted-site-migration/site-migration-identify?source=sites-dashboard&ref=new-site-popover&action=import'
	);
};

const offerClick = () => {
	recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_item', {
		action: 'offer',
	} );
	window.location.assign( localizeUrl( 'https://wordpress.com/pricing/' ) );
};

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
						onClick: wordpressClick,
					} }
				/>
				<MenuItem
					icon={ <JetpackLogo /> }
					heading={ translate( 'Via the Jetpack plugin' ) }
					description={ preventWidows(
						translate( 'Install the Jetpack plugin on an existing site' )
					) }
					buttonProps={ {
						onClick: jetpackClick,
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
						onClick: migrateClick,
					} }
				/>
				<MenuItem
					icon={ <Icon icon={ download } size={ 18 } /> }
					heading="Import"
					description={ preventWidows(
						translate( 'Use a backup file to import your content into a new site.' )
					) }
					buttonProps={ {
						onClick: importClick,
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
						onClick: offerClick,
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
