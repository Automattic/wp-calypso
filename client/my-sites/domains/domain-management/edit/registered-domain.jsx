/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card/compact';
import Notice from 'components/notice';
import FormToggle from 'components/forms/form-toggle';
import DomainWarnings from 'my-sites/domains/components/domain-warnings';
import Header from './card/header';
import {
	domainManagementContactsPrivacy,
	domainManagementEmail,
	domainManagementNameServers,
	domainManagementTransfer,
} from 'my-sites/domains/paths';
import { disablePrivacyProtection, enablePrivacyProtection } from 'lib/upgrades/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import { togglePrivacy } from 'state/sites/domains/actions';
import Property from './card/property';
import SubscriptionSettings from './card/subscription-settings';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import IcannVerificationCard from 'my-sites/domains/domain-management/components/icann-verification/icann-verification-card';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

class RegisteredDomain extends React.Component {
	state = {
		submitting: false,
	};

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

	togglePrivacy = () => {
		const { selectedSite, translate } = this.props;
		const { privateDomain, name } = this.props.domain;

		this.setState( { submitting: true } );

		const callback = error => {
			if ( error ) {
				this.props.errorNotice( error.message );
			} else {
				this.props.togglePrivacy( selectedSite.ID, name );

				const notice = privateDomain
					? translate( 'Privacy has been successfully disabled!' )
					: translate( 'Yay, privacy has been successfully enabled!' );

				this.props.successNotice( notice, {
					duration: 5000,
				} );
			}

			this.setState( { submitting: false } );
		};

		if ( privateDomain ) {
			disablePrivacyProtection( name, callback );
		} else {
			enablePrivacyProtection( name, callback );
		}
	};

	getPrivacyProtection() {
		const { privateDomain, privacyAvailable } = this.props.domain;
		const { translate } = this.props;
		const { submitting } = this.state;

		if ( ! privacyAvailable ) {
			return false;
		}

		return (
			<Property label={ translate( 'Privacy Protection' ) }>
				{
					<FormToggle
						wrapperClassName="edit__privacy-protection-toggle"
						checked={ privateDomain }
						toggling={ submitting }
						disabled={ submitting }
						onChange={ this.togglePrivacy }
					/>
				}
			</Property>
		);
	}

	handlePaymentSettingsClick = () => {
		this.props.paymentSettingsClick( this.props.domain );
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
					'pendingGappsTosAcceptanceDomains',
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
		const path = domainManagementEmail( this.props.selectedSite.slug, this.props.domain.name );

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

		return <VerticalNavItem path={ path }>{ translate( 'Contacts' ) }</VerticalNavItem>;
	}

	transferNavItem() {
		const path = domainManagementTransfer( this.props.selectedSite.slug, this.props.domain.name );

		return (
			<VerticalNavItem path={ path }>{ this.props.translate( 'Transfer Domain' ) }</VerticalNavItem>
		);
	}

	render() {
		const { domain, translate } = this.props;

		return (
			<div>
				{ this.domainWarnings() }
				<div className="edit__domain-details-card">
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
	}
}

const paymentSettingsClick = domain =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			`Clicked "Payment Settings" Button on a ${ domain.type } in Edit`,
			'Domain Name',
			domain.name
		),
		recordTracksEvent( 'calypso_domain_management_edit_payment_settings_click', {
			section: domain.type,
		} )
	);

export default connect(
	null,
	{
		errorNotice,
		paymentSettingsClick,
		successNotice,
		togglePrivacy,
	}
)( localize( RegisteredDomain ) );
