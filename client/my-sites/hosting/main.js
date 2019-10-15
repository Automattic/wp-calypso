/** @format */

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
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import SFTPCard from './sftp-card';
import PhpMyAdminCard from './phpmyadmin-card';

/**
 * Style dependencies
 */
import './style.scss';

const Hosting = ( { translate } ) => {
	return (
		<Main className="hosting is-wide-layout">
			<PageViewTracker path="hosting/:site" title="Hosting" />
			<DocumentHead title={ translate( 'Hosting' ) } />
			<SidebarNavigation />
			<div className="hosting__cards">
				<SFTPCard />
				<PhpMyAdminCard />
			</div>
		</Main>
	);
};

export default connect( state => {
	return {
		site: getSelectedSite( state ),
		siteId: getSelectedSiteId( state ),
		siteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( Hosting ) );
