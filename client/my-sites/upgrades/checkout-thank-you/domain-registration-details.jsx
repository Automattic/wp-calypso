/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { getDomainManagementUrl } from './utils';
import { isGoogleApps } from 'lib/products-values';
import i18n from 'lib/mixins/i18n';
import PurchaseDetail from 'components/purchase-detail';
import userFactory from 'lib/user';

const user = userFactory();

const DomainRegistrationDetails = ( { selectedSite, domain, purchases } ) => {
	const googleAppsWasPurchased = purchases.some( isGoogleApps ),
		hasOtherPrimaryDomain = selectedSite.options.is_mapped_domain && selectedSite.domain !== domain;

	return (
		<div>
			<div className="checkout-thank-you__domain-registration-details-compact">
				<PurchaseDetail
					icon="notice"
					title={ i18n.translate( 'Verify your email address' ) }
					description={ i18n.translate( 'We sent you an email with a request to verify your new domain. Unverified domains may be suspended.' ) }
					buttonText={ i18n.translate( 'Learn more about verifying your domain' ) }
					href="//support.wordpress.com/domains/register-domain/#email-validation-and-verification"
					target="_blank"
					requiredText={ i18n.translate( 'Important! Your action is required.' ) }
					isRequired />

				{ googleAppsWasPurchased && (
					<PurchaseDetail
						icon="cog"
						title={ i18n.translate( 'Finish setting up your Google Apps account' ) }
						description={
							i18n.translate(
								'We emailed you at %(email)s with login information for your new Google Apps account. ' +
								'If you can\'t find it, try a global search for "Google Apps".',
								{
									args: { email: user.get().email }
								}
							)
						}
						buttonText={ i18n.translate( 'Learn more about Google Apps' ) }
						href="//apps.google.com/learning-center/"
						target="_blank"
						isRequired />
				) }
			</div>

			<PurchaseDetail
				icon="time"
				title={ i18n.translate( 'When will it be ready?' ) }
				description={ i18n.translate( 'Your domain should start working immediately, but may be unreliable during the first 72 hours.' ) }
				buttonText={ i18n.translate( 'Learn more about your domain' ) }
				href="//support.wordpress.com/domains/register-domain/"
				target="_blank" />

			{ hasOtherPrimaryDomain && (
				<PurchaseDetail
					icon="globe"
					title={ i18n.translate( 'Your primary domain' ) }
					description={
						i18n.translate(
							'Your existing domain, {{em}}%(domain)s{{/em}}, is the domain visitors see when they visit your site. ' +
							'All other custom domains redirect to the primary domain.',
							{
								args: { domain: selectedSite.domain },
								components: { em: <em /> }
							}
						)
					}
					buttonText={ i18n.translate( 'Change primary domain' ) }
					href={ getDomainManagementUrl( selectedSite, domain ) } />
			) }
		</div>
	);
};

DomainRegistrationDetails.propTypes = {
	purchases: React.PropTypes.array.isRequired,
	selectedSite: React.PropTypes.object.isRequired,
	domain: React.PropTypes.string.isRequired
};

export default DomainRegistrationDetails;

