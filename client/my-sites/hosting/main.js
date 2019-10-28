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
import Banner from 'components/banner';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import { getSelectedSiteId } from 'state/ui/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import SFTPCard from './sftp-card';
import PhpMyAdminCard from './phpmyadmin-card';

/**
 * Style dependencies
 */
import './style.scss';

const Hosting = ( { translate, isDisabled } ) => {
	return (
		<Main className="hosting is-wide-layout">
			<PageViewTracker path="hosting/:site" title="Hosting" />
			<DocumentHead title={ translate( 'Hosting' ) } />
			<SidebarNavigation />
			{ isDisabled && (
				<Banner
					title={ translate(
						'Please active SFTP and PHPMyAdmin access to begin using these features.'
					) }
					icon="info"
					callToAction={ translate( 'Activate' ) }
					disableHref
				/>
			) }
			<div className="hosting__cards">
				<SFTPCard disabled={ isDisabled } />
				<PhpMyAdminCard disabled={ isDisabled } />
			</div>
		</Main>
	);
};

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		isDisabled: ! isSiteAutomatedTransfer( state, siteId ),
	};
} )( localize( Hosting ) );
