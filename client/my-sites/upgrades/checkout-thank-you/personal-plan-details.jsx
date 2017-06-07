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
import { AdWords } from './icons';

const PersonalPlanDetails = ( { translate, selectedSite, sitePlans } ) => {
	const plan = find( sitePlans.data, isPersonal );

	return (
		<div className="checkout-thank-you__use-svg-icon">
			<CustomDomainPurchaseDetail
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
			/>

			<PurchaseDetail
				icon="speaker"
				svgIcon={ <AdWords /> }
				title={ translate( 'Advertising Removed' ) }
				description={ translate(
					'With your plan, all WordPress.com advertising has been removed from your site. ' +
					'You can upgrade to a Business plan to also remove the WordPress.com footer credit.'
				) }
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
