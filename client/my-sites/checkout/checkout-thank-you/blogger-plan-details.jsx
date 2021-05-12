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
import { isBlogger, isGSuiteOrExtraLicenseOrGoogleWorkspace } from '@automattic/calypso-products';
import CustomDomainPurchaseDetail from './custom-domain-purchase-detail';
import GoogleAppsDetails from './google-apps-details';

const BloggerPlanDetails = ( { selectedSite, sitePlans, purchases } ) => {
	const plan = find( sitePlans.data, isBlogger );
	const googleAppsWasPurchased = purchases.some( isGSuiteOrExtraLicenseOrGoogleWorkspace );

	return (
		<div>
			{ googleAppsWasPurchased && <GoogleAppsDetails purchases={ purchases } /> }

			<CustomDomainPurchaseDetail
				onlyBlogDomain={ true }
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
			/>
		</div>
	);
};

BloggerPlanDetails.propTypes = {
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ).isRequired,
	sitePlans: PropTypes.object.isRequired,
};

export default localize( BloggerPlanDetails );
