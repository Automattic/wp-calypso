/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { flowRight as compose } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card/compact';
import Notice from 'components/notice';
import DomainWarnings from 'my-sites/domains/components/domain-warnings';
import Header from './card/header';
import {
	domainManagementContactsPrivacy,
	domainManagementNameServers,
	domainManagementTransfer,
} from 'my-sites/domains/paths';
import { emailManagement } from 'my-sites/email/paths';
import Property from './card/property';
import SubscriptionSettings from './card/subscription-settings';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import { withLocalizedMoment } from 'components/localized-moment';
import IcannVerificationCard from 'my-sites/domains/domain-management/components/icann-verification';
import { recordPaymentSettingsClick } from './payment-settings-analytics';

class RegisteredDomain extends React.Component {
	getAutoRenewalOrExpirationDate() {
		const { domain, translate } = this.props;

		if ( domain.isAutoRenewing ) {
			return (
				<Property
					label={ translate( 'Renews on', {
						comment:
							'The corresponding date is in a different cell in the UI, ' +
							'the date is not included within the translated string',
					} ) }
				>
					{ domain.autoRenewalMoment.format( 'LL' ) }
				</Property>
			);
		}

		return (
			<Property
				label={ translate( 'Expires on', {
					comment:
						'The corresponding date is in a different cell in the UI, ' +
						'the date is not included within the translated string',
				} ) }
			>
				{ domain.expirationMoment.format( 'LL' ) }
			</Property>
		);
	}

	getLabel( { status, icon, message, href } ) {
		return (
			<a href={ href }>
				<Notice isCompact status={ status } icon={ icon }>
					{ message }
				</Notice>
			</a>
		);
	}

	handlePaymentSettingsClick = () => {
		this.props.recordPaymentSettingsClick( this.props.domain );
	};

	domainWarnings() {
		return (
			<DomainWarnings
				domain={ this.props.domain }
				position="registered-domain"
				selectedSite={ this.props.selectedSite }
				ruleWhiteList={ [
					'expiredDomainsCanManage',
					'expiringDomainsCanManage',
					'newDomainsWithPrimary',
					'newDomains',
					'pendingGSuiteTosAcceptanceDomains',
					'expiredDomainsCannotManage',
					'expiringDomainsCannotManage',
					'pendingTransfer',
					'newTransfersWrongNS',
					'pendingConsent',
				] }
			/>
		);
	}

	getVerticalNav() {
		const { expirationMoment, expired, pendingTransfer } = this.props.domain;
		const inNormalState = ! pendingTransfer && ! expired;
		const inGracePeriod = this.props.moment().subtract( 18, 'days' ) <= expirationMoment;

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

	render() {
		const { domain, translate } = this.props;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div>
				{ this.domainWarnings() }
				<div className="domain-details-card">
					{ domain.isPendingIcannVerification && domain.currentUserCanManage && (
						<IcannVerificationCard
							selectedDomainName={ domain.name }
							selectedSiteSlug={ this.props.selectedSite.slug }
						/>
					) }

					<Header { ...this.props } />

					<Card>
						<Property label={ translate( 'Type', { context: 'A type of domain.' } ) }>
							{ translate( 'Registered Domain' ) }
						</Property>

						<Property
							label={ translate( 'Registered on', {
								comment:
									'The corresponding date is in a different cell in the UI, ' +
									'the date is not included within the translated string',
							} ) }
						>
							{ domain.registrationMoment.format( 'LL' ) }
						</Property>

						{ this.getAutoRenewalOrExpirationDate() }

						<SubscriptionSettings
							type={ domain.type }
							subscriptionId={ domain.subscriptionId }
							siteSlug={ this.props.selectedSite.slug }
							onClick={ this.handlePaymentSettingsClick }
						/>
					</Card>
				</div>

				{ this.getVerticalNav() }
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default compose(
	connect( null, { recordPaymentSettingsClick } ),
	localize,
	withLocalizedMoment
)( RegisteredDomain );
