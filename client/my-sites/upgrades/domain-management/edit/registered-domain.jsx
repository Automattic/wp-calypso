/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import analyticsMixin from 'lib/mixins/analytics';
import Card from 'components/card/compact';
import Notice from 'components/notice';
import DomainWarnings from 'my-sites/upgrades/components/domain-warnings';
import Header from './card/header';
import paths from 'my-sites/upgrades/paths';
import Property from './card/property';
import SubscriptionSettings from './card/subscription-settings';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import IcannVerificationCard from 'my-sites/upgrades/domain-management/components/icann-verification/icann-verification-card';

const RegisteredDomain = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'edit' ) ],

	getAutoRenewalOrExpirationDate() {
		const domain = this.props.domain;

		if ( domain.isAutoRenewing ) {
			return (
				<Property label={ this.translate( 'Renews on' ) }>
					{ domain.autoRenewalDate }
				</Property>
			);
		}

		return (
			<Property label={ this.translate( 'Expires on' ) }>
				{ domain.expirationMoment.format( 'MMMM D, YYYY' ) }
			</Property>
		);
	},

	getLabel( { status, icon, message, href } ) {
		return (
			<a href={ href }>
				<Notice
					isCompact
					status={ status }
					icon={ icon }>{ message }
				</Notice>
			</a>
		);
	},

	getPrivacyProtection() {
		const { hasPrivacyProtection, privateDomain, name, pendingTransfer } = this.props.domain,
			{ slug } = this.props.selectedSite,
			privacyPath = paths.domainManagementContactsPrivacy( slug, name ),
			transferPath = paths.domainManagementTransferOut( slug, name );

		if ( pendingTransfer ) {
			return this.getLabel( {
				status: 'is-warning',
				icon: 'notice',
				message: this.translate( 'Pending Transfer', {
					context: 'An icon label when domain is pending transfer.'
				} )
			} );
		}

		if ( hasPrivacyProtection ) {
			if ( privateDomain ) {
				return this.getLabel( {
					status: 'is-success',
					icon: 'lock',
					href: privacyPath,
					message: this.translate( 'On', {
						context: 'An icon label when Privacy Protection is enabled.'
					} )
				} );
			}

			return this.getLabel( {
				status: 'is-warning',
				icon: 'notice',
				href: transferPath,
				message: this.translate( 'Disabled for Transfer', {
					context: 'An icon label when Privacy Protection is temporarily disabled for transfer.'
				} )
			} );
		}

		return this.getLabel( {
			status: 'is-warning',
			icon: 'notice',
			href: privacyPath,
			message: this.translate( 'None', {
				context: 'An icon label when Privacy Protection is not purchased by the user.'
			} )
		} );
	},

	handlePaymentSettingsClick() {
		this.recordEvent( 'paymentSettingsClick', this.props.domain );
	},

	domainWarnings() {
		return <DomainWarnings
			domain={ this.props.domain }
			selectedSite={ this.props.selectedSite }
			ruleWhiteList={ [
				'expiredDomainsCanManage',
				'expiringDomainsCanManage',
				'newDomainsWithPrimary',
				'newDomains',
				'pendingGappsTosAcceptanceDomains',
				'expiredDomainsCannotManage',
				'expiringDomainsCannotManage',
				'pendingTransfer'
			] } />;
	},

	getVerticalNav() {
		if ( this.props.domain.expired ) {
			return null;
		}

		return (
			<VerticalNav>
				{ this.emailNavItem() }
				{ this.nameServersNavItem() }
				{ this.contactsPrivacyNavItem() }
				{ this.transferNavItem() }
			</VerticalNav>
		);
	},

	emailNavItem() {
		if ( this.props.domain.pendingTransfer ) {
			return null;
		}

		const path = paths.domainManagementEmail(
			this.props.selectedSite.slug,
			this.props.domain.name
		);

		return (
			<VerticalNavItem path={ path }>
				{ this.translate( 'Email' ) }
			</VerticalNavItem>
		);
	},

	nameServersNavItem() {
		if ( this.props.domain.pendingTransfer ) {
			return null;
		}

		const path = paths.domainManagementNameServers(
			this.props.selectedSite.slug,
			this.props.domain.name
		);

		return (
			<VerticalNavItem path={ path }>
				{ this.translate( 'Name Servers and DNS' ) }
			</VerticalNavItem>
		);
	},

	contactsPrivacyNavItem() {
		if ( this.props.domain.pendingTransfer ) {
			return null;
		}

		const path = paths.domainManagementContactsPrivacy(
			this.props.selectedSite.slug,
			this.props.domain.name
		);

		return (
			<VerticalNavItem path={ path }>
				{ this.translate( 'Contacts and Privacy' ) }
			</VerticalNavItem>
		);
	},

	transferNavItem() {
		const path = paths.domainManagementTransfer(
			this.props.selectedSite.slug,
			this.props.domain.name
		);

		return (
			<VerticalNavItem path={ path }>
				{ this.translate( 'Transfer Domain' ) }
			</VerticalNavItem>
		);
	},

	render() {
		const domain = this.props.domain;

		return (
			<div>
				{ this.domainWarnings() }
				<div className="domain-details-card">
					<Header { ...this.props } />

					<Card>
						<Property label={ this.translate( 'Type', { context: 'A type of domain.' } ) }>
							{ this.translate( 'Registered Domain' ) }
						</Property>

						<Property label={ this.translate( 'Registered on' ) }>
							{ domain.registrationDate }
						</Property>

						{ this.getAutoRenewalOrExpirationDate() }

						<Property label={ this.translate( 'Privacy Protection' ) }>
							{ this.getPrivacyProtection() }
						</Property>

						<SubscriptionSettings
							onClick={ this.handlePaymentSettingsClick } />
					</Card>

					{ domain.isPendingIcannVerification && domain.currentUserCanManage && <IcannVerificationCard selectedDomainName={ domain.name } selectedSite={ this.props.selectedSite } /> }
				</div>

				{ this.getVerticalNav() }
			</div>
		);
	}
} );

export default RegisteredDomain;
