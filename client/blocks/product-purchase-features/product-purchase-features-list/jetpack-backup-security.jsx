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
	const buttonProps = rewindActive
		? {
				url: `/stats/activity/${ site.slug }`,
				label: translate( 'View Activity Log' ),
			}
		: {
				url: 'https://dashboard.vaultpress.com/',
				label: translate( 'Visit security dashboard' ),
			};
	return (
		<div className="product-purchase-features-list__item">
			<QueryRewindStatus siteId={ siteId } />
			<PurchaseDetail
				icon="flag"
				title={ translate( 'Site Security' ) }
				description={ translate(
					'Your site is being securely backed up and scanned with real-time sync.'
				) }
				buttonText={ buttonProps.label }
				href={ buttonProps.url }
			/>
		</div>
	);
};

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	return {
		rewindActive: isRewindActive( state, siteId ),
		site: getSelectedSite( state ),
		siteId,
	};
} )( localize( JetpackBackupSecurity ) );
