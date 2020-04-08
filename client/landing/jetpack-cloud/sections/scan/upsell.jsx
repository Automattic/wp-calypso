/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import SecurityIcon from 'landing/jetpack-cloud/components/security-icon';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { getSelectedSiteSlug } from 'state/ui/selectors';

function ScanUpsellPage( { siteSlug } ) {
	return (
		<Main wideLayout className="scan__main">
			<DocumentHead title="Scanner" />
			<SidebarNavigation />
			<div className="scan__content">
				<SecurityIcon />
				<h1>{ translate( 'Your site does not have scan' ) }</h1>
				<Button primary href={ `jetpack.com/redirect/${ siteSlug }` } className="scan__button">
					{ translate( 'Upgrade now' ) }
				</Button>
			</div>
		</Main>
	);
}

export default connect( state => ( {
	siteSlug: getSelectedSiteSlug( state ),
} ) )( ScanUpsellPage );
