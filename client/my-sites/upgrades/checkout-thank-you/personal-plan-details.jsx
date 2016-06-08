/**
 * External dependencies
 */
import find from 'lodash/find';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isPersonal } from 'lib/products-values';
import CustomDomainPurchaseDetail from './custom-domain-purchase-detail';
import PurchaseDetail from 'components/purchase-detail';

const PersonalPlanDetails = ( { translate, selectedSite, sitePlans } ) => {
	const plan = find( sitePlans.data, isPersonal );

	return (
		<div>
			{ plan.hasDomainCredit && <CustomDomainPurchaseDetail selectedSite={ selectedSite } /> }

			<PurchaseDetail
				icon="speaker"
				title={ translate( 'No Ads' ) }
				description={ translate(
					'Personal plan automatically removes all Ads from your site. ' +
					'Now your visitors can enjoy your great content without distractions!'
				)	}
			/>
		</div>
	);
};

PersonalPlanDetails.propTypes = {
	selectedSite: React.PropTypes.oneOfType( [
		React.PropTypes.bool,
		React.PropTypes.object
	] ).isRequired,
	sitePlans: React.PropTypes.object.isRequired
};

export default localize( PersonalPlanDetails );
