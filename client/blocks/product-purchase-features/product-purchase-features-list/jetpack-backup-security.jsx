/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';
import QueryRewindStatus from 'components/data/query-rewind-status';
import { isRewindActive } from 'state/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';

const JetpackBackupSecurity = ( { rewindActive, site, siteId, translate } ) => {
	const securlty_url = rewindActive
		? '/stats/activity/' + site.slug
		: 'https://dashboard.vaultpress.com/';

	const button_text = rewindActive
		? translate( 'View Activity Log' )
		: translate( 'Visit security dashboard' );
	return (
		<div className="product-purchase-features-list__item">
			<QueryRewindStatus siteId={ siteId } />
			<PurchaseDetail
				icon="flag"
				title={ translate( 'Site Security' ) }
				description={ translate(
					'Your site is being securely backed up and scanned with real-time sync.'
				) }
				buttonText={ button_text }
				href={ securlty_url }
			/>
		</div>
	);
};

export default connect( state => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );

	return {
		rewindActive: isRewindActive( state, siteId ),
		site,
		siteId,
	};
} )( localize( JetpackBackupSecurity ) );
