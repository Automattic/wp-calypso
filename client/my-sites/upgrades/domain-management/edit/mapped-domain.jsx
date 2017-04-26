/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analyticsMixin from 'lib/mixins/analytics';
import Card from 'components/card/compact';
import Header from './card/header';
import Property from './card/property';
import SubscriptionSettings from './card/subscription-settings';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import DomainWarnings from 'my-sites/upgrades/components/domain-warnings';
import paths from 'my-sites/upgrades/paths';

const MappedDomain = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'edit' ) ],

	getAutoRenewalOrExpirationDate() {
		const { domain, translate } = this.props;

		if ( domain.isAutoRenewing ) {
			return (
				<Property label={ translate( 'Mapping renews on' ) }>
					{ domain.autoRenewalMoment.format( 'LL' ) }
				</Property>
			);
		}

		const expirationMessage = domain.expirationMoment && domain.expirationMoment.format( 'LL' ) ||
			<em>{ translate( 'Never Expires', { context: 'Expiration detail for a mapped domain' } ) }</em>;

		return (
			<Property label={ translate( 'Mapping expires on' ) }>
				{ expirationMessage }
			</Property>
		);
	},

	handlePaymentSettingsClick() {
		this.recordEvent( 'paymentSettingsClick', this.props.domain );
	},

	domainWarnings() {
		return <DomainWarnings
			domain={ this.props.domain }
			selectedSite={ this.props.selectedSite }
			ruleWhiteList={ [ 'wrongNSMappedDomains' ] } />;
	},

	render() {
		return (
			<div>
				{ this.domainWarnings() }
				{ this.getDomainDetailsCard() }
				{ this.getVerticalNav() }
			</div>
		);
	},

	getDomainDetailsCard() {
		return (
			<div className="domain-details-card">
				<Header { ...this.props } />

				<Card>
					<Property label={ this.props.translate( 'Type', { context: 'A type of domain.' } ) }>
						{ this.props.translate( 'Mapped Domain' ) }
					</Property>

					{ this.getAutoRenewalOrExpirationDate() }

					<SubscriptionSettings
						onClick={ this.handlePaymentSettingsClick } />
				</Card>
			</div>
		);
	},

	getVerticalNav() {
		return (
			<VerticalNav>
				{ this.emailNavItem() }
				{ this.dnsRecordsNavItem() }
			</VerticalNav>
		);
	},

	emailNavItem() {
		const path = paths.domainManagementEmail(
			this.props.selectedSite.slug,
			this.props.domain.name
		);

		return (
			<VerticalNavItem path={ path }>
				{ this.props.translate( 'Email' ) }
			</VerticalNavItem>
		);
	},

	dnsRecordsNavItem() {
		const path = paths.domainManagementDns(
			this.props.selectedSite.slug,
			this.props.domain.name
		);

		return (
			<VerticalNavItem path={ path }>
				{ this.props.translate( 'DNS Records' ) }
			</VerticalNavItem>
		);
	}
} );

export { MappedDomain };
export default localize( MappedDomain );
