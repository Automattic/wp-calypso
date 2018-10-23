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
import { getSelectedSite } from 'state/ui/selectors';

const JetpackSiteActivity = ( { site, translate } ) => (
	<div className="product-purchase-features-list__item">
		<PurchaseDetail
			icon={ <img alt="" src="/calypso/images/illustrations/jetpack-site-activity.svg" /> }
			title={ translate( 'Site Activity' ) }
			description={ translate(
				'View a chronological list of all the changes and updates to your site in an organized, readable way.'
			) }
			buttonText={ translate( 'View your site activity' ) }
			href={ `/activity-log/${ site.slug }` }
		/>
	</div>
);

export default connect( state => {
	return {
		site: getSelectedSite( state ),
	};
} )( localize( JetpackSiteActivity ) );
