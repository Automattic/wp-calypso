import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { WordPressLogo, JetpackLogo, BigSkyLogo } from '@automattic/components';
import { localizeUrl, useHasEnTranslation } from '@automattic/i18n-utils';
import { formatNumber } from '@automattic/number-formatters';
import { download, reusableBlock, Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
// TODO: This will need to be updated to use whatever image we decide on.
import devSiteBanner from 'calypso/assets/images/a8c-for-agencies/dev-site-banner.svg';
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
	page( '/setup/site-migration?source=sites-dashboard&ref=new-site-popover&action=migrate' );
};

const importClick = () => {
	recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_import' );
	recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_item', {
		action: 'import',
	} );
	page(
		'/setup/site-migration/create-site?source=sites-dashboard&ref=new-site-popover&action=import'
	);
};

const bigSkyClick = () => {
	recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_item', {
		action: 'big-sky',
	} );
	page( '/setup/ai-site-builder' );
};

const offerClick = () => {
	recordTracksEvent( 'calypso_sites_dashboard_new_site_action_click_item', {
		action: 'offer',
	} );
	window.location.assign( localizeUrl( 'https://wordpress.com/setup/onboarding' ) );
};

export const Content = () => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	return (
		<>
			<Column heading={ translate( 'Add new site' ) }>
				<MenuItem
					icon={ <WordPressLogo /> }
					heading={ translate( 'WordPress.com' ) }
					description={ translate( 'Build and grow your site, all in one powerful platform.' ) }
					buttonProps={ {
						onClick: wordpressClick,
					} }
				/>
				<MenuItem
					icon={ <BigSkyLogo.Mark /> }
					heading={ translate( 'Build with AI' ) }
					description={ translate(
						'Prompt, edit, and launch WordPress websites with Artificial Intelligence.'
					) }
					buttonProps={ {
						onClick: bigSkyClick,
					} }
				/>
				<MenuItem
					icon={ <JetpackLogo /> }
					heading={ translate( 'Via the Jetpack plugin' ) }
					description={ translate( 'Install the Jetpack plugin on an existing site.' ) }
					buttonProps={ {
						onClick: jetpackClick,
					} }
				/>
			</Column>
			<Column heading={ translate( 'Migrate and import' ) }>
				<MenuItem
					icon={ <Icon icon={ reusableBlock } size={ 18 } /> }
					heading={ translate( 'Migrate' ) }
					description={
						hasEnTranslation( 'Bring your entire WordPress site to WordPress.com.' )
							? translate( 'Bring your entire WordPress site to WordPress.com.' )
							: translate( 'Bring your theme, plugins, and content to WordPress.com.' )
					}
					buttonProps={ {
						onClick: migrateClick,
					} }
				/>
				<MenuItem
					icon={ <Icon icon={ download } size={ 18 } /> }
					heading={ translate( 'Import' ) }
					description={
						hasEnTranslation( 'Use a backup to only import content from other platforms.' )
							? translate( 'Use a backup to only import content from other platforms.' )
							: translate( 'Use a backup file to import your content into a new site.' )
					}
					buttonProps={ {
						onClick: importClick,
					} }
				/>
			</Column>
			<Column>
				<MenuItem
					isBanner
					icon={ <img src={ devSiteBanner } alt="Get a free domain and up to 55% off" /> }
					heading={ translate( 'Get a free domain and up to %(percentage)s off', {
						args: {
							percentage: formatNumber( 0.55, {
								numberFormatOptions: { style: 'percent' },
							} ),
							comment: 'percentage like 55% off',
						},
					} ) }
					description={ translate(
						'Save up to %(percentage)s on annual plans and get a free custom domain for a year. Your next site is just a step away.',
						{
							args: {
								percentage: formatNumber( 0.55, {
									numberFormatOptions: { style: 'percent' },
								} ),
								comment: 'percentage like 55% off',
							},
						}
					) }
					buttonProps={ {
						onClick: offerClick,
					} }
				>
					<div>
						<div className={ clsx( 'sites-add-new-site-popover__cta' ) }>
							{ translate( 'Unlock offer' ) }
						</div>
					</div>
				</MenuItem>
			</Column>
		</>
	);
};

export default Content;
