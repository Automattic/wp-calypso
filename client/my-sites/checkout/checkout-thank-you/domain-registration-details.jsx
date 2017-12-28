/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getDomainManagementUrl } from './utils';
import GoogleAppsDetails from './google-apps-details';
import { isGoogleApps } from 'client/lib/products-values';
import PurchaseDetail from 'client/components/purchase-detail';
import supportUrls from 'client/lib/url/support';

const DomainRegistrationDetails = ( { selectedSite, domain, purchases } ) => {
	const googleAppsWasPurchased = purchases.some( isGoogleApps ),
		domainContactEmailVerified = purchases.some( purchase => purchase.isEmailVerified ),
		hasOtherPrimaryDomain =
			selectedSite.options &&
			selectedSite.options.is_mapped_domain &&
			selectedSite.domain !== domain;

	return (
		<div>
			<div className="checkout-thank-you__domain-registration-details-compact">
				{ ! domainContactEmailVerified && (
					<PurchaseDetail
						icon={ <img src="/calypso/images/upgrades/check-emails-desktop.svg" /> }
						title={ i18n.translate( 'Verify your email address' ) }
						description={ i18n.translate(
							'We sent you an email with a request to verify your new domain. Unverified domains may be suspended.'
						) }
						buttonText={ i18n.translate( 'Learn more about verifying your domain' ) }
						href={ supportUrls.EMAIL_VALIDATION_AND_VERIFICATION }
						target="_blank"
						rel="noopener noreferrer"
						requiredText={ i18n.translate( 'Important! Your action is required.' ) }
						isRequired
					/>
				) }

				{ googleAppsWasPurchased && <GoogleAppsDetails isRequired /> }
			</div>

			<PurchaseDetail
				icon={ <img src="/calypso/images/upgrades/wait-time.svg" /> }
				title={ i18n.translate( 'When will it be ready?', { comment: '"it" refers to a domain' } ) }
				description={ i18n.translate(
					'Your domain should start working immediately, but may be unreliable during the first 72 hours.'
				) }
				buttonText={ i18n.translate( 'Learn more about your domain' ) }
				href={ supportUrls.REGISTER_DOMAIN }
				target="_blank"
				rel="noopener noreferrer"
			/>

			{ hasOtherPrimaryDomain && (
				<PurchaseDetail
					icon={ <img src="/calypso/images/upgrades/custom-domain.svg" /> }
					title={ i18n.translate( 'Your primary domain' ) }
					description={ i18n.translate(
						'Your existing domain, {{em}}%(domain)s{{/em}}, is the domain visitors see when they visit your site. ' +
							'All other custom domains redirect to the primary domain.',
						{
							args: { domain: selectedSite.domain },
							components: { em: <em /> },
						}
					) }
					buttonText={ i18n.translate( 'Change primary domain' ) }
					href={ getDomainManagementUrl( selectedSite, domain ) }
				/>
			) }
		</div>
	);
};

DomainRegistrationDetails.propTypes = {
	domain: PropTypes.string.isRequired,
	purchases: PropTypes.array.isRequired,
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ).isRequired,
};

export default DomainRegistrationDetails;
