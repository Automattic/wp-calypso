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
import QueryRewindState from 'components/data/query-rewind-state';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getRewindState } from 'state/selectors';

const JetpackBackupSecurity = ( { backupEngine, site, siteId, translate } ) => (
	<div className="product-purchase-features-list__item">
		<QueryRewindState siteId={ siteId } />
		<PurchaseDetail
			icon="flag"
			title={ translate( 'Site Security' ) }
			description={ translate(
				'Your site is safe with secure backups and real-time scans.'
			) }
			buttonText={
				backupEngine === 'rewind'
					? translate( 'View Activity Log' )
					: translate( 'Visit security dashboard' )
			}
			href={
				backupEngine === 'rewind'
					? `/stats/activity/${ site.slug }`
					: 'https://dashboard.vaultpress.com'
			}
		/>
	</div>
);

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const rewindState = getRewindState( state, siteId );

	return {
		backupEngine: rewindState.reason === 'vp_active_on_site' ? 'vaultpress' : 'rewind',
		site: getSelectedSite( state ),
		siteId,
	};
} )( localize( JetpackBackupSecurity ) );
