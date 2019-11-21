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
import FormattedHeader from 'components/formatted-header';
import { getSelectedSiteId } from 'state/ui/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import canSiteViewAtomicHosting from 'state/selectors/can-site-view-atomic-hosting';
import SFTPCard from './sftp-card';
import PhpMyAdminCard from './phpmyadmin-card';
import SupportCard from './support-card';
import PhpVersionCard from './php-version-card';
import { isEnabled } from 'config';

/**
 * Style dependencies
 */
import './style.scss';

const Hosting = ( { translate, isDisabled, canViewAtomicHosting, siteId } ) => {
	if ( ! canViewAtomicHosting ) {
		return null;
	}

	const sftpPhpMyAdminFeaturesEnabled = true;
	isEnabled( 'hosting/sftp-phpmyadmin' ) && siteId > 168768859;

	return (
		<Main className="hosting is-wide-layout">
			<PageViewTracker path="/hosting-config/:site" title="Hosting Configuration" />
			<DocumentHead title={ translate( 'Hosting Configuration' ) } />
			<SidebarNavigation />
			<FormattedHeader
				headerText={ translate( 'Hosting Configuration' ) }
				subHeaderText={ translate( 'Access your website and database directly.' ) }
				align="left"
			/>
			{ isDisabled && (
				<Banner
					title={ translate( 'Please activate the hosting access to begin using these features.' ) }
					icon="info"
					callToAction={ translate( 'Activate' ) }
					disableHref
				/>
			) }
			<div className="hosting__layout">
				<div className="hosting__layout-col">
					<PhpVersionCard />
					{ sftpPhpMyAdminFeaturesEnabled && <SFTPCard disabled={ isDisabled } /> }
					{ sftpPhpMyAdminFeaturesEnabled && <PhpMyAdminCard disabled={ isDisabled } /> }
				</div>
				<div className="hosting__layout-col">
					<SupportCard />
				</div>
			</div>
		</Main>
	);
};

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		isDisabled: ! isSiteAutomatedTransfer( state, siteId ),
		canViewAtomicHosting: canSiteViewAtomicHosting( state ),
		siteId,
	};
} )( localize( Hosting ) );
