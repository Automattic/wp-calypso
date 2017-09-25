/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import Header from './card/header';
import Property from './card/property';
import SubscriptionSettings from './card/subscription-settings';
import Card from 'components/card/compact';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import analyticsMixin from 'lib/mixins/analytics';
import DomainWarnings from 'my-sites/domains/components/domain-warnings';
import paths from 'my-sites/domains/paths';

const MappedDomain = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'edit' ) ],

	getAutoRenewalOrExpirationDate() {
		const { domain, translate } = this.props;

		if ( domain.isAutoRenewing ) {
			return (
				<Property label={ translate( 'Mapping renews on', { comment: 'The corresponding date is in a different cell in the UI, the date is not included within the translated string' } ) }>
					{ domain.autoRenewalMoment.format( 'LL' ) }
				</Property>
			);
		}

		const expirationMessage = domain.expirationMoment && domain.expirationMoment.format( 'LL' ) ||
			<em>{ translate( 'Never Expires', { context: 'Expiration detail for a mapped domain' } ) }</em>;

		return (
			<Property label={ translate( 'Mapping expires on', { comment: 'The corresponding date is in a different cell in the UI, the date is not included within the translated string' } ) }>
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
			position="mapped-domain"
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
		const { domain, selectedSite, translate } = this.props;

		return (
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
