/** @format */

/**
 * External dependencies
 */

import { find } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isPersonal, isGoogleApps } from 'lib/products-values';
import CustomDomainPurchaseDetail from './custom-domain-purchase-detail';
import GoogleAppsDetails from './google-apps-details';
import PurchaseDetail from 'components/purchase-detail';

const PersonalPlanDetails = ( { translate, selectedSite, sitePlans, purchases } ) => {
	const plan = find( sitePlans.data, isPersonal );
	const googleAppsWasPurchased = purchases.some( isGoogleApps );

	return (
		<div>
			{ googleAppsWasPurchased && <GoogleAppsDetails isRequired /> }

			<CustomDomainPurchaseDetail
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
			/>

			<PurchaseDetail
				icon={ <img src="/calypso/images/upgrades/adwords.svg" /> }
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
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ).isRequired,
	sitePlans: PropTypes.object.isRequired,
};

export default localize( PersonalPlanDetails );
