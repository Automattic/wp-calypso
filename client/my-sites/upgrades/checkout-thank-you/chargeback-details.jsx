/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { isPlan } from 'lib/products-values';
import i18n from 'lib/mixins/i18n';
import PurchaseDetail from './purchase-detail';

const ChargebackDetails = ( { selectedSite } ) => {
	return (
		<div>
			<PurchaseDetail
				additionalClass="important"
				title={ i18n.translate( 'Important!' ) }
				description={ i18n.translate( 'The chargeback fee has been paid and you can now use the full features of your site.' ) }
				buttonText={ i18n.translate( 'Write a Post' ) }
				href={ '/post/' + selectedSite.slug } />

			{ ! isPlan( selectedSite.plan ) ? <PurchaseDetail
				additionalClass="upgrade-now"
				title={ i18n.translate( 'Upgrade Now' ) }
				description={ i18n.translate( 'Take your blog to the next level by upgrading to one of our plans.' ) }
				buttonText={ i18n.translate( 'View Plans' ) }
				href={ '/plans/' + selectedSite.slug } /> : null }
		</div>
	);
};

ChargebackDetails.propTypes = {
	selectedSite: React.PropTypes.object.isRequired
};

export default ChargebackDetails;
