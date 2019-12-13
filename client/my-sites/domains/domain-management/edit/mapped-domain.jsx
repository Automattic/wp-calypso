/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CompactCard as Card } from '@automattic/components';
import { withLocalizedMoment } from 'components/localized-moment';
import Header from './card/header';
import Property from './card/property';
import SubscriptionSettings from './card/subscription-settings';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import DomainWarnings from 'my-sites/domains/components/domain-warnings';
import {
	domainManagementDns,
	domainManagementDomainConnectMapping,
	domainTransferIn,
} from 'my-sites/domains/paths';
import { emailManagement } from 'my-sites/email/paths';
import { recordPaymentSettingsClick } from './payment-settings-analytics';

export class MappedDomain extends React.Component {
	getAutoRenewalOrExpirationDate() {
		const { domain, translate, moment } = this.props;

		if ( domain.isAutoRenewing ) {
			return (
				<Property
					label={ translate( 'Mapping renews on', {
						comment:
							'The corresponding date is in a different cell in the UI, the date is not included within the translated string',
					} ) }
				>
					{ moment( domain.autoRenewalDate ).format( 'LL' ) }
				</Property>
			);
		}

		const expirationMessage = ( domain.expiry && moment( domain.expiry ).format( 'LL' ) ) || (
			<em>
				{ translate( 'Never Expires', { context: 'Expiration detail for a mapped domain' } ) }
			</em>
		);

		return (
			<Property
				label={ translate( 'Mapping expires on', {
					comment:
						'The corresponding date is in a different cell in the UI, the date is not included within the translated string',
				} ) }
			>
				{ expirationMessage }
			</Property>
		);
	}

	handlePaymentSettingsClick = () => {
		this.props.recordPaymentSettingsClick( this.props.domain );
	};

	domainWarnings() {
		return (
			<DomainWarnings
				domain={ this.props.domain }
				position="mapped-domain"
				selectedSite={ this.props.selectedSite }
				ruleWhiteList={ [ 'wrongNSMappedDomains' ] }
			/>
		);
	}

	render() {
		return (
			<div>
				{ this.domainWarnings() }
				{ this.getDomainDetailsCard() }
				{ this.getVerticalNav() }
			</div>
		);
	}

	getDomainDetailsCard() {
		const { domain, selectedSite, translate } = this.props;

		return (
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			<div className="domain-details-card">
				<Header { ...this.props } />

				<Card>
					<Property label={ translate( 'Type', { context: 'A type of domain.' } ) }>
						{ translate( 'Mapped Domain' ) }
					</Property>

					{ this.getAutoRenewalOrExpirationDate() }

					<SubscriptionSettings
						type={ domain.type }
						subscriptionId={ domain.subscriptionId }
						siteSlug={ selectedSite.slug }
						onClick={ this.handlePaymentSettingsClick }
					/>
				</Card>
			</div>
		);
	}

	getVerticalNav() {
		return (
			<VerticalNav>
				{ this.emailNavItem() }
				{ this.dnsRecordsNavItem() }
				{ this.domainConnectMappingNavItem() }
				{ this.transferMappedDomainNavItem() }
			</VerticalNav>
		);
	}

	emailNavItem() {
		const path = emailManagement( this.props.selectedSite.slug, this.props.domain.name );

		return <VerticalNavItem path={ path }>{ this.props.translate( 'Email' ) }</VerticalNavItem>;
	}

	dnsRecordsNavItem() {
		const path = domainManagementDns( this.props.selectedSite.slug, this.props.domain.name );

		return (
			<VerticalNavItem path={ path }>{ this.props.translate( 'DNS Records' ) }</VerticalNavItem>
		);
	}

	domainConnectMappingNavItem() {
		const { supportsDomainConnect, hasWpcomNameservers, pointsToWpcom } = this.props.domain;
		if ( ! supportsDomainConnect || hasWpcomNameservers || pointsToWpcom ) {
			return;
		}

		const path = domainManagementDomainConnectMapping(
			this.props.selectedSite.slug,
			this.props.domain.name
		);

		return (
			<VerticalNavItem path={ path }>
				{ this.props.translate( 'Connect Your Domain' ) }
			</VerticalNavItem>
		);
	}

	transferMappedDomainNavItem() {
		const { domain, selectedSite, translate } = this.props;

		if ( domain.expired || domain.isSubdomain || ! domain.isEligibleForInboundTransfer ) {
			return null;
		}

		const path = domainTransferIn( selectedSite.slug, domain.name, true );

		return (
			<VerticalNavItem path={ path }>
				{ translate( 'Transfer Domain to WordPress.com' ) }
			</VerticalNavItem>
		);
	}
}

export default connect( null, { recordPaymentSettingsClick } )(
	localize( withLocalizedMoment( MappedDomain ) )
);
