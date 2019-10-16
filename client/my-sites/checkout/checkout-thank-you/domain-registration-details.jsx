/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getDomainManagementUrl } from './utils';
import GoogleAppsDetails from './google-apps-details';
import { isGoogleApps, isBlogger } from 'lib/products-values';
import PurchaseDetail from 'components/purchase-detail';
import { EMAIL_VALIDATION_AND_VERIFICATION, DOMAIN_WAITING } from 'lib/url/support';

const DomainRegistrationDetails = ( { selectedSite, domain, purchases } ) => {
	const googleAppsWasPurchased = purchases.some( isGoogleApps ),
		domainContactEmailVerified = purchases.some( purchase => purchase.isEmailVerified ),
		hasOtherPrimaryDomain =
			selectedSite.options &&
			selectedSite.options.is_mapped_domain &&
			selectedSite.domain !== domain,
		isRestrictedToBlogDomains = purchases.some( isBlogger ) || isBlogger( selectedSite.plan );

	return (
		<div>
			<div className="checkout-thank-you__domain-registration-details-compact">
				{ ! domainContactEmailVerified && (
					<PurchaseDetail
						icon={ <img alt="" src="/calypso/images/upgrades/check-emails-desktop.svg" /> }
						title={ translate( 'Verify your email address' ) }
						description={ translate(
							'We sent you an email with a request to verify your new domain. Unverified domains may be suspended.'
						) }
						buttonText={ translate( 'Learn more about verifying your domain' ) }
						href={ EMAIL_VALIDATION_AND_VERIFICATION }
						target="_blank"
						rel="noopener noreferrer"
						requiredText={ translate( 'Important! Your action is required.' ) }
						isRequired
					/>
				) }

				{ googleAppsWasPurchased && <GoogleAppsDetails isRequired /> }
			</div>

			<PurchaseDetail
				icon={ <img alt="" src="/calypso/images/upgrades/wait-time.svg" /> }
				title={ translate( 'When will it be ready?', { comment: '"it" refers to a domain' } ) }
				description={ translate(
					'Your domain should start working immediately, but may be unreliable during the first 72 hours.'
				) }
				buttonText={ translate( 'Learn more about your domain' ) }
				href={ DOMAIN_WAITING }
				target="_blank"
				rel="noopener noreferrer"
			/>

			{ hasOtherPrimaryDomain && (
				<PurchaseDetail
					icon={
						<img
							alt=""
							src={
								isRestrictedToBlogDomains
									? '/calypso/images/illustrations/custom-domain-blogger.svg'
									: '/calypso/images/upgrades/custom-domain.svg'
							}
						/>
					}
					title={ translate( 'Your primary domain' ) }
					description={ translate(
						'Your existing domain, {{em}}%(domain)s{{/em}}, is the domain visitors see when they visit your site. ' +
							'All other custom domains redirect to the primary domain.',
						{
							args: { domain: selectedSite.domain },
							components: { em: <em /> },
						}
					) }
					buttonText={ translate( 'Change primary domain' ) }
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
