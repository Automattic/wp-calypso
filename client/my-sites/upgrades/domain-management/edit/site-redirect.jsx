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
import paths from 'my-sites/upgrades/paths';

const SiteRedirect = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'edit' ) ],

	getAutoRenewalOrExpirationDate() {
		const { domain, translate } = this.props;

		if ( domain.isAutoRenewing ) {
			return (
				<Property label={ translate( 'Redirect renews on' ) }>
					{ domain.autoRenewalMoment.format( 'LL' ) }
				</Property>
			);
		}

		return (
			<Property label={ translate( 'Redirect expires on' ) }>
				{ domain.expirationMoment.format( 'LL' ) }
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
						<Property label={ this.props.translate( 'Type', { context: 'A type of domain.' } ) }>
							{ this.props.translate( 'Site Redirect' ) }
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
		return (
			<VerticalNavItem path={ paths.domainManagementRedirectSettings( this.props.selectedSite.slug, this.props.domain.name ) }>
				{ this.props.translate( 'Redirect Settings' ) }
			</VerticalNavItem>
		);
	}
} );

export default localize( SiteRedirect );
