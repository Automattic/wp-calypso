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
	paths = require( 'my-sites/upgrades/paths' ),
	config = require( 'config' );

const SiteRedirect = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'edit' ) ],

	getAutoRenewalOrExpirationDate() {
		const domain = this.props.domain;

		if ( domain.isAutoRenewing ) {
			return (
				<Property label={ this.translate( 'Redirect renews on' ) }>
					{ domain.autoRenewalDate }
				</Property>
			);
		}

		return (
			<Property label={ this.translate( 'Redirect expires on' ) }>
				{ domain.expirationDate }
			</Property>
		);
	},

	handlePaymentSettingsClick() {
		this.recordEvent( 'paymentSettingsClick', this.props.domain );
	},

	render() {
		return (
			<div>
				<div className="domain-details-card">
					<Header { ...this.props } />

					<Card>
						<Property label={ this.translate( 'Type', { context: 'A type of domain.' } ) }>
							{ this.translate( 'Site Redirect' ) }
						</Property>

						{ this.getAutoRenewalOrExpirationDate() }

						<SubscriptionSettings
							onClick={ this.handlePaymentSettingsClick } />
					</Card>
				</div>

				<VerticalNav>
					{ this.siteRedirectNavItem() }
				</VerticalNav>
			</div>
		);
	},

	siteRedirectNavItem() {
		if ( ! config.isEnabled( 'upgrades/domain-management/site-redirect' ) ) {
			return;
		}

		return (
			<VerticalNavItem path={ paths.domainManagementRedirectSettings( this.props.selectedSite.domain, this.props.domain.name ) }>
				{ this.translate( 'Redirect Settings' ) }
			</VerticalNavItem>
		);
	}
} );

module.exports = SiteRedirect;
