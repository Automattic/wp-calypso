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
import analyticsMixin from 'client/lib/mixins/analytics';
import Card from 'client/components/card/compact';
import Header from './card/header';
import Property from './card/property';
import SubscriptionSettings from './card/subscription-settings';
import VerticalNav from 'client/components/vertical-nav';
import VerticalNavItem from 'client/components/vertical-nav/item';
import paths from 'client/my-sites/domains/paths';

const SiteRedirect = createReactClass( {
	displayName: 'SiteRedirect',
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
		const { domain, translate } = this.props;

		return (
			<div>
				<div className="domain-details-card">
					<Header { ...this.props } />

					<Card>
						<Property label={ translate( 'Type', { context: 'A type of domain.' } ) }>
							{ translate( 'Site Redirect' ) }
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

				<VerticalNav>{ this.siteRedirectNavItem() }</VerticalNav>
			</div>
		);
	},

	siteRedirectNavItem() {
		return (
			<VerticalNavItem
				path={ paths.domainManagementRedirectSettings(
					this.props.selectedSite.slug,
					this.props.domain.name
				) }
			>
				{ this.props.translate( 'Redirect Settings' ) }
			</VerticalNavItem>
		);
	},
} );

export default localize( SiteRedirect );
