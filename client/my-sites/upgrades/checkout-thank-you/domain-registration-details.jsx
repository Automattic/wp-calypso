/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Gauge from 'components/gauge';
import { getDomainManagementUrl } from './utils';
import GoogleAppsDetails from './google-apps-details';
import { isGoogleApps } from 'lib/products-values';
import PurchaseDetail from 'components/purchase-detail';
import supportUrls from 'lib/url/support';
import { WaitTime, CheckEmailsDesktop } from './icons';

export class DomainRegistrationDetails extends Component {
	static propTypes = {
		domain: PropTypes.string.isRequired,
		purchases: PropTypes.array.isRequired,
		selectedSite: PropTypes.oneOfType( [
			PropTypes.bool,
			PropTypes.object
		] ).isRequired
	};

	renderEmailVerfication() {
		const { translate } = this.props;

		return [
			<Gauge key="gauge" percentage={ 90 } metric={ translate( 'Almost Completed' ) } width={ 118 } />,
			<em key="message" className="checkout-thank-you__action-required">
				{ translate( 'Important! Your action is required.' ) }
			</em>,
			<PurchaseDetail
				key="detail"
				icon="mail"
				svgIcon={ <CheckEmailsDesktop /> }
				title={ translate( 'Verify your email address' ) }
				description={ translate( 'We sent you an email with a request to verify your new domain. Unverified domains may be suspended.' ) } // eslint-disable-line max-len
				buttonText={ translate( 'Learn more about verifying your domain' ) }
				href={ supportUrls.EMAIL_VALIDATION_AND_VERIFICATION }
				target="_blank"
				rel="noopener noreferrer"
				isRequired />
		];
	}

	render() {
		const { selectedSite, domain, purchases, translate } = this.props;
		const googleAppsWasPurchased = purchases.some( isGoogleApps ),
			domainContactEmailVerified = purchases.some( purchase => purchase.isEmailVerified ),
			hasOtherPrimaryDomain = selectedSite.options && selectedSite.options.is_mapped_domain && selectedSite.domain !== domain;

		return (
			<div>
				<div className="checkout-thank-you__domain-registration-details-compact">
					{ domainContactEmailVerified && this.renderEmailVerfication() }
					{ googleAppsWasPurchased && <GoogleAppsDetails isRequired /> }
				</div>

				<PurchaseDetail
					icon="time"
					svgIcon={ <WaitTime /> }
					title={ translate( 'When will it be ready?', { comment: '"it" refers to a domain' } ) }
					description={ translate( 'Your domain should start working immediately, but may be unreliable during the first 72 hours.' ) } // eslint-disable-line max-len
					buttonText={ translate( 'Learn more about your domain' ) }
					href={ supportUrls.REGISTER_DOMAIN }
					target="_blank"
					rel="noopener noreferrer" />

				{ hasOtherPrimaryDomain && (
					<PurchaseDetail
						icon="globe"
						title={ translate( 'Your primary domain' ) }
						description={
							translate(
								'Your existing domain, {{em}}%(domain)s{{/em}}, is the domain visitors see when they visit your site. ' +
								'All other custom domains redirect to the primary domain.',
								{
									args: { domain: selectedSite.domain },
									components: { em: <em /> }
								}
							)
						}
						buttonText={ translate( 'Change primary domain' ) }
						href={ getDomainManagementUrl( selectedSite, domain ) } />
				) }
			</div>
		);
	}
}

export default localize( DomainRegistrationDetails );

