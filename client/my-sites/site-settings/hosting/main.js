/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Banner from 'components/banner';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import canSiteViewAtomicHosting from 'state/selectors/can-site-view-atomic-hosting';
import SFTPCard from './sftp-card';
import PhpMyAdminCard from './phpmyadmin-card';
import DataLossWarning from './data-loss-warning';
import SiteSettingsNavigation from 'my-sites/site-settings/navigation';
import FormattedHeader from 'components/formatted-header';

/**
 * Style dependencies
 */
import './style.scss';

const Hosting = ( { translate, isDisabled, canViewAtomicHosting, site } ) => {
	if ( ! canViewAtomicHosting ) {
		return null;
	}
	return (
		<Main className="site-settings hosting">
			<PageViewTracker path="/hosting-admin/:site" title="SFTP & MySQL" />
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<SidebarNavigation />
			<FormattedHeader
				headerText={ translate( 'Settings' ) }
				align="left"
			/>
			<SiteSettingsNavigation site={ site } section="hosting" />
			{ isDisabled && (
				<Banner
					title={ translate(
						'Please active SFTP and phpMyAdmin access to begin using these features.'
					) }
					icon="info"
					callToAction={ translate( 'Activate' ) }
					disableHref
				/>
			) }
			<SFTPCard disabled={ isDisabled } />
			<PhpMyAdminCard disabled={ isDisabled } />
			{ ! isDisabled && <DataLossWarning /> }
		</Main>
	);
};

export default connect( state => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );

	return {
		site,
		isDisabled: ! isSiteAutomatedTransfer( state, siteId ),
		canViewAtomicHosting: canSiteViewAtomicHosting( state ),
	};
} )( localize( Hosting ) );
