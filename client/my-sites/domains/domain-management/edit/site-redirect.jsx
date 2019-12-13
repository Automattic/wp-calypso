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
import Header from './card/header';
import Property from './card/property';
import SubscriptionSettings from './card/subscription-settings';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import { withLocalizedMoment } from 'components/localized-moment';
import { domainManagementRedirectSettings } from 'my-sites/domains/paths';
import { recordPaymentSettingsClick } from './payment-settings-analytics';

class SiteRedirect extends React.Component {
	getAutoRenewalOrExpirationDate() {
		const { domain, translate, moment } = this.props;

		if ( domain.isAutoRenewing ) {
			return (
				<Property label={ translate( 'Redirect renews on' ) }>
					{ moment( domain.autoRenewalDate ).format( 'LL' ) }
				</Property>
			);
		}

		return (
			<Property label={ translate( 'Redirect expires on' ) }>
				{ moment( domain.expiry ).format( 'LL' ) }
			</Property>
		);
	}

	handlePaymentSettingsClick = () => {
		this.props.recordPaymentSettingsClick( this.props.domain );
	};

	render() {
		const { domain, translate } = this.props;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div>
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace*/ }
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
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	siteRedirectNavItem() {
		return (
			<VerticalNavItem
				path={ domainManagementRedirectSettings(
					this.props.selectedSite.slug,
					this.props.domain.name
				) }
			>
				{ this.props.translate( 'Redirect Settings' ) }
			</VerticalNavItem>
		);
	}
}

export default connect( null, { recordPaymentSettingsClick } )(
	localize( withLocalizedMoment( SiteRedirect ) )
);
