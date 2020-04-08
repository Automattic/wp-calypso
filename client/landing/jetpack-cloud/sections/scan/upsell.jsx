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
import StatsFooter from 'landing/jetpack-cloud/components/stats-footer';
import { getSelectedSiteSlug } from 'state/ui/selectors';

function ScanUpsellPage( { siteSlug } ) {
	return (
		<Main wideLayout className="scan__main">
			<DocumentHead title="Scanner" />
			<SidebarNavigation />
			<div className="scan__content">
				<SecurityIcon icon="info" />
				<h1 className="scan__header">{ translate( 'Your site does not have scan' ) }</h1>
				<p>
					{ translate(
						'Get automatic scanning and one-click fixes to keep your site one step ahead of security threats.'
					) }
				</p>
				<Button
					primary
					// TODO: Use Jetpack redirect.
					href={ `https://wordpress.com/checkout/jetpack_scan/${ siteSlug }` }
					className="scan__button"
					target="_blank"
				>
					{ translate( 'Upgrade now' ) }
				</Button>
			</div>
			<StatsFooter
				noticeText="Failing to plan is planning to fail. Regular backups ensure that should the worst happen, you are prepared. Jetpack Backups has you covered."
				noticeLink="https://jetpack.com/upgrade/backups"
			/>
		</Main>
	);
}

export default connect( state => ( {
	siteSlug: getSelectedSiteSlug( state ),
} ) )( ScanUpsellPage );
