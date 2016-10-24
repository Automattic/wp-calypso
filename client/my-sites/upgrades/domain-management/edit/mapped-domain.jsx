/**
 * External dependencies
 */
const React = require( 'react' );

/**
 * Internal dependencies
 */
const analyticsMixin = require( 'lib/mixins/analytics' ),
	Card = require( 'components/card/compact' ),
	Header = require( './card/header' ),
	Property = require( './card/property' ),
	SubscriptionSettings = require( './card/subscription-settings' ),
	VerticalNav = require( 'components/vertical-nav' ),
	VerticalNavItem = require( 'components/vertical-nav/item' ),
	DomainWarnings = require( 'my-sites/upgrades/components/domain-warnings' ),
	paths = require( 'my-sites/upgrades/paths' );

const MappedDomain = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'edit' ) ],

	getAutoRenewalOrExpirationDate() {
		const domain = this.props.domain;

		if ( domain.isAutoRenewing ) {
			return (
				<Property label={ this.translate( 'Mapping renews on' ) }>
					{ domain.autoRenewalDate }
				</Property>
			);
		}

		const expirationMessage = domain.expirationMoment && domain.expirationMoment.format( 'MMMM D, YYYY' ) ||
			<em>{ this.translate( 'Never Expires', { context: 'Expiration detail for a mapped domain' } ) }</em>;

		return (
			<Property label={ this.translate( 'Mapping expires on' ) }>
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
			ruleWhiteList={ [ 'wrongNSMappedDomains' ] }/>;
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
					<Property label={ this.translate( 'Type', { context: 'A type of domain.' } ) }>
						{ this.translate( 'Mapped Domain' ) }
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
				{ this.translate( 'Email' ) }
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
				{ this.translate( 'DNS Records' ) }
			</VerticalNavItem>
		);
	}
} );

module.exports = MappedDomain;
