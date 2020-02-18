/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import { Card } from '@automattic/components';
import VerticalNav from 'components/vertical-nav';
import { recordTracksEvent, recordGoogleEvent } from 'state/analytics/actions';
import { withLocalizedMoment } from 'components/localized-moment';
import DomainStatus from '../card/domain-status';
import VerticalNavItem from 'components/vertical-nav/item';
import { emailManagement } from 'my-sites/email/paths';
import {
	domainManagementContactsPrivacy,
	domainManagementNameServers,
	domainManagementTransfer,
} from 'my-sites/domains/paths';
import IcannVerificationCard from 'my-sites/domains/domain-management/components/icann-verification';
import { isRecentlyRegistered } from 'lib/domains/utils';
import { DOMAINS } from 'lib/url/support';
import SubscriptionSettings from '../card/subscription-settings';
import { recordPaymentSettingsClick } from '../payment-settings-analytics';

import CompactFormToggle from 'components/forms/form-toggle/compact';

class RegisteredDomainType extends React.Component {
	getVerticalNavigation() {
		const { expiry, expired, pendingTransfer } = this.props.domain;
		const { moment } = this.props;
		const inNormalState = ! pendingTransfer && ! expired;
		const inGracePeriod = moment().subtract( 18, 'days' ) <= moment( expiry );

		return (
			<VerticalNav>
				{ inNormalState && this.emailNavItem() }
				{ ( inNormalState || inGracePeriod ) && this.nameServersNavItem() }
				{ ( inNormalState || inGracePeriod ) && this.contactsPrivacyNavItem() }
				{ ( ! expired || inGracePeriod ) && this.transferNavItem() }
			</VerticalNav>
		);
	}

	emailNavItem() {
		const path = emailManagement( this.props.selectedSite.slug, this.props.domain.name );

		return <VerticalNavItem path={ path }>{ this.props.translate( 'Email' ) }</VerticalNavItem>;
	}

	nameServersNavItem() {
		const path = domainManagementNameServers(
			this.props.selectedSite.slug,
			this.props.domain.name
		);

		return (
			<VerticalNavItem path={ path }>
				{ this.props.translate( 'Name Servers and DNS' ) }
			</VerticalNavItem>
		);
	}

	contactsPrivacyNavItem() {
		const { translate } = this.props;
		const path = domainManagementContactsPrivacy(
			this.props.selectedSite.slug,
			this.props.domain.name
		);

		return <VerticalNavItem path={ path }>{ translate( 'Contacts and Privacy' ) }</VerticalNavItem>;
	}

	transferNavItem() {
		const path = domainManagementTransfer( this.props.selectedSite.slug, this.props.domain.name );

		return (
			<VerticalNavItem path={ path }>{ this.props.translate( 'Transfer Domain' ) }</VerticalNavItem>
		);
	}

	resolveStatus() {
		const { domain, translate } = this.props;
		const { registrationDate } = domain;

		if ( domain.isPendingIcannVerification && domain.currentUserCanManage ) {
			return {
				statusText: translate( 'Action required' ),
				statusClass: 'status-error',
				icon: 'info',
			};
		}

		if ( domain.expired ) {
			return {
				statusText: translate( 'Action required' ),
				statusClass: 'status-error',
				icon: 'info',
			};
		}

		const recentlyRegistered = isRecentlyRegistered( registrationDate );

		if ( recentlyRegistered ) {
			return {
				statusText: translate( 'Activating' ),
				statusClass: 'status-pending',
				icon: 'cloud_upload',
			};
		}

		return {
			statusText: translate( 'Active' ),
			statusClass: 'status-success',
			icon: 'check_circle',
		};
	}

	renderExpired() {
		const { domain, translate } = this.props;
		const domainsLink = <a href={ DOMAINS } target="_blank" rel="noopener noreferrer" />;

		if ( ! domain.expired ) {
			return null;
		}

		return (
			<div>
				{ translate(
					'Your domain has expired and is no longer active. {{domainsLink}}Learn more{{/domainsLink}}',
					{
						components: {
							domainsLink,
						},
					}
				) }
			</div>
		);
	}

	renderRecentlyRegistered() {
		const { domain, translate } = this.props;
		const { registrationDate, name: domain_name } = domain;
		const domainsLink = <a href={ DOMAINS } target="_blank" rel="noopener noreferrer" />;

		const recentlyRegistered = isRecentlyRegistered( registrationDate );

		if ( ! recentlyRegistered ) {
			return null;
		}

		return (
			<div>
				{ translate(
					'We are setting up {{strong}}%(domain)s{{/strong}} for you. It should start working immediately but may be unreliable in the first 30 minutes. {{domainsLink}}Learn more{{/domainsLink}}',
					{
						args: {
							domain: domain_name,
						},
						components: {
							domainsLink,
							strong: <strong />,
						},
					}
				) }
			</div>
		);
	}

	renderAutoRenew() {
		return (
			<Card compact={ true }>
				Auto Renew (on) <CompactFormToggle checked={ true } />
			</Card>
		);
	}

	handlePaymentSettingsClick = () => {
		this.props.recordPaymentSettingsClick( this.props.domain );
	};

	render() {
		const { domain, moment } = this.props;
		const { name: domain_name } = domain;

		const { statusText, statusClass, icon } = this.resolveStatus();

		const newStatusDesignAutoRenew = config.isEnabled( 'domains/new-status-design/auto-renew' );

		return (
			<div className="domain-types__container">
				<DomainStatus
					header={ domain_name }
					statusText={ statusText }
					statusClass={ statusClass }
					icon={ icon }
				>
					{ domain.isPendingIcannVerification && domain.currentUserCanManage && (
						<IcannVerificationCard
							selectedDomainName={ domain.name }
							selectedSiteSlug={ this.props.selectedSite.slug }
							explanationContext="new-status"
							compact={ true }
						/>
					) }
					{ this.renderExpired() }
					{ this.renderRecentlyRegistered() }
					{ ! newStatusDesignAutoRenew && (
						<div>
							<SubscriptionSettings
								type={ domain.type }
								subscriptionId={ domain.subscriptionId }
								siteSlug={ this.props.selectedSite.slug }
								onClick={ this.handlePaymentSettingsClick }
							/>
						</div>
					) }
				</DomainStatus>
				<Card compact={ true }>
					{ domain.expired
						? this.props.translate( 'Expired: %(expiry_date)s', {
								args: {
									expiry_date: moment( domain.expiry ).format( 'LL' ),
								},
						  } )
						: this.props.translate( 'Expires: %(expiry_date)s', {
								args: {
									expiry_date: moment( domain.expiry ).format( 'LL' ),
								},
						  } ) }
				</Card>
				{ newStatusDesignAutoRenew && this.renderAutoRenew() }
				{ this.getVerticalNavigation() }
			</div>
		);
	}
}

export default connect( null, {
	recordTracksEvent,
	recordGoogleEvent,
	recordPaymentSettingsClick,
} )( withLocalizedMoment( localize( RegisteredDomainType ) ) );
