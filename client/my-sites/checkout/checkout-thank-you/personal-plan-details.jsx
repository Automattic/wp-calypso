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
import { isPersonal, isGSuiteOrExtraLicenseOrGoogleWorkspace } from '@automattic/calypso-products';
import CustomDomainPurchaseDetail from './custom-domain-purchase-detail';
import GoogleAppsDetails from './google-apps-details';
import PurchaseDetail from 'calypso/components/purchase-detail';

/**
 * Image dependencies
 */
import adsRemovedImage from 'calypso/assets/images/illustrations/removed-ads.svg';
import earnImage from 'calypso/assets/images/customer-home/illustration--task-earn.svg';

const PersonalPlanDetails = ( { translate, selectedSite, sitePlans, purchases } ) => {
	const plan = find( sitePlans.data, isPersonal );
	const googleAppsWasPurchased = purchases.some( isGSuiteOrExtraLicenseOrGoogleWorkspace );

	return (
		<div>
			{ googleAppsWasPurchased && <GoogleAppsDetails purchases={ purchases } /> }

			<CustomDomainPurchaseDetail
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
			/>

			<PurchaseDetail
				icon={ <img alt={ translate( 'Earn Illustration' ) } src={ earnImage } /> }
				title={ translate( 'Make money with your website' ) }
				description={ translate(
					'Accept credit card payments today for just about anything – physical and digital goods, services, ' +
						'donations and tips, or access to your exclusive content.'
				) }
				buttonText={ translate( 'Start Earning' ) }
				href={ '/earn/' + selectedSite.slug }
			/>

			<PurchaseDetail
				icon={ <img alt="" src={ adsRemovedImage } /> }
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
