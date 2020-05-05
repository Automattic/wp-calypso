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
import { getSelectedSiteSlug } from 'state/ui/selectors';

/**
 * Image dependencies
 */
import siteActivity from 'assets/images/illustrations/site-activity.svg';

const SiteActivity = ( { siteSlug, translate } ) => (
	<div className="product-purchase-features-list__item">
		<PurchaseDetail
			icon={ <img alt="" src={ siteActivity } /> }
			title={ translate( 'Activity' ) }
			description={ translate(
				'View a chronological list of all the changes and updates to your site in an organized, readable way.'
			) }
			buttonText={ translate( 'View your site activity' ) }
			href={ `/activity-log/${ siteSlug }` }
		/>
	</div>
);

export default connect( ( state ) => ( {
	siteSlug: getSelectedSiteSlug( state ),
} ) )( localize( SiteActivity ) );
