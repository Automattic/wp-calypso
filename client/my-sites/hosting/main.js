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
import DataLossWarning from './data-loss-warning';
import RestoreWpConfig from './restore-wp-config';

/**
 * Style dependencies
 */
import './style.scss';

const Hosting = ( { translate, isDisabled, isWpConfigMissing } ) => {
	return (
		<Main className="hosting is-wide-layout">
			<PageViewTracker path="/hosting-admin/:site" title="SFTP & MySQL" />
			<DocumentHead title={ translate( 'SFTP & MySQL' ) } />
			<SidebarNavigation />
			{ ! isDisabled && isWpConfigMissing && <RestoreWpConfig /> }
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
			<div className="hosting__cards">
				<SFTPCard disabled={ isDisabled } />
				<PhpMyAdminCard disabled={ isDisabled } />
			</div>
			{ ! isDisabled && <DataLossWarning /> }
		</Main>
	);
};

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		isDisabled: ! isSiteAutomatedTransfer( state, siteId ),
	};
} )( localize( Hosting ) );
