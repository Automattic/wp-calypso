/** @format */
/**
 * External dependencies
 */
import React from 'react';
import createReactClass from 'create-react-class';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analyticsMixin from 'lib/mixins/analytics';
import Card from 'components/card/compact';
import Notice from 'components/notice';
import DomainWarnings from 'my-sites/domains/components/domain-warnings';
import Header from './card/header';
import {
	domainManagementContactsPrivacy,
	domainManagementNameServers,
	domainManagementTransfer,
	domainManagementTransferOut,
} from 'my-sites/domains/paths';
import { emailManagement } from 'my-sites/email/paths';
import Property from './card/property';
import SubscriptionSettings from './card/subscription-settings';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import IcannVerificationCard from 'my-sites/domains/domain-management/components/icann-verification/icann-verification-card';

const RegisteredDomain = createReactClass( {
	displayName: 'RegisteredDomain',
	mixins: [ analyticsMixin( 'domainManagement', 'edit' ) ],

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
	},

	getLabel( { status, icon, message, href } ) {
		return (
			<a href={ href }>
				<Notice isCompact status={ status } icon={ icon }>
					{ message }
				</Notice>
			</a>
		);
	},

	getPrivacyProtection() {
		const {
				hasPrivacyProtection,
				privateDomain,
				privacyAvailable,
				name,
				pendingTransfer,
			} = this.props.domain,
			{ slug } = this.props.selectedSite,
			{ translate } = this.props,
			privacyPath = domainManagementContactsPrivacy( slug, name ),
			transferPath = domainManagementTransferOut( slug, name );
		let label;

		if ( ! privacyAvailable ) {
			return false;
		}

		if ( pendingTransfer ) {
			label = this.getLabel( {
				status: 'is-warning',
				icon: 'notice',
				message: translate( 'Pending Transfer', {
					context: 'An icon label when domain is pending transfer.',
				} ),
			} );
		} else if ( hasPrivacyProtection ) {
			if ( privateDomain ) {
				label = this.getLabel( {
					status: 'is-success',
					icon: 'lock',
					href: privacyPath,
					message: translate( 'On', {
						context: 'An icon label when Privacy Protection is enabled.',
					} ),
				} );
			} else {
				label = this.getLabel( {
					status: 'is-warning',
					icon: 'notice',
					href: transferPath,
					message: translate( 'Disabled for Transfer', {
						context: 'An icon label when Privacy Protection is temporarily disabled for transfer.',
					} ),
				} );
			}
		} else {
			label = this.getLabel( {
				status: 'is-warning',
				icon: 'notice',
				href: privacyPath,
				message: translate( 'None', {
					context: 'An icon label when Privacy Protection is not purchased by the user.',
				} ),
			} );
		}

		return <Property label={ translate( 'Privacy Protection' ) }>{ label }</Property>;
	},

	handlePaymentSettingsClick() {
		this.recordEvent( 'paymentSettingsClick', this.props.domain );
	},

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
					'pendingGappsTosAcceptanceDomains',
					'expiredDomainsCannotManage',
					'expiringDomainsCannotManage',
					'pendingTransfer',
					'newTransfersWrongNS',
					'pendingConsent',
				] }
			/>
		);
	},

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
	},

	emailNavItem() {
		const path = emailManagement( this.props.selectedSite.slug, this.props.domain.name );

		return <VerticalNavItem path={ path }>{ this.props.translate( 'Email' ) }</VerticalNavItem>;
	},

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
	},

	contactsPrivacyNavItem() {
		const { privacyAvailable } = this.props.domain;
		const { translate } = this.props;
		const path = domainManagementContactsPrivacy(
			this.props.selectedSite.slug,
			this.props.domain.name
		);

		return (
			<VerticalNavItem path={ path }>
				{ privacyAvailable ? translate( 'Contacts and Privacy' ) : translate( 'Contacts' ) }
			</VerticalNavItem>
		);
	},

	transferNavItem() {
		const path = domainManagementTransfer( this.props.selectedSite.slug, this.props.domain.name );

		return (
			<VerticalNavItem path={ path }>{ this.props.translate( 'Transfer Domain' ) }</VerticalNavItem>
		);
	},

	render() {
		const { domain, translate } = this.props;

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

						{ this.getPrivacyProtection() }

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
	},
} );

export default localize( RegisteredDomain );
