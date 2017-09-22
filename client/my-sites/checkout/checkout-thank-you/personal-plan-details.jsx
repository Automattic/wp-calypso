/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import CustomDomainPurchaseDetail from './custom-domain-purchase-detail';
import PurchaseDetail from 'components/purchase-detail';
import { isPersonal } from 'lib/products-values';

const PersonalPlanDetails = ( { translate, selectedSite, sitePlans } ) => {
	const plan = find( sitePlans.data, isPersonal );

	return (
		<div>
			<CustomDomainPurchaseDetail
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
			/>

			<PurchaseDetail
				icon="speaker"
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
	selectedSite: PropTypes.oneOfType( [
		PropTypes.bool,
		PropTypes.object
	] ).isRequired,
	sitePlans: PropTypes.object.isRequired
};

export default localize( PersonalPlanDetails );
