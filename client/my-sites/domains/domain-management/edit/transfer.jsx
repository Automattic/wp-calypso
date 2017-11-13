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
import Header from './card/header';
import Property from './card/property';
import SubscriptionSettings from './card/subscription-settings';
import DomainWarnings from 'my-sites/domains/components/domain-warnings';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

class Transfer extends React.PureComponent {
	domainWarnings() {
		return (
			<DomainWarnings
				domain={ this.props.domain }
				position="transfer-domain"
				selectedSite={ this.props.selectedSite }
				ruleWhiteList={ [ 'transferStatus' ] }
			/>
		);
	}

	render() {
		return (
			<div>
				{ this.domainWarnings() }
				{ this.getDomainDetailsCard() }
			</div>
		);
	}

	handlePaymentSettingsClick = () => {
		this.props.paymentSettingsClick( this.props.domain );
	};

	getDomainDetailsCard() {
		const { domain, selectedSite, translate } = this.props;

		return (
			<div className="edit__domain-details-card">
				<Header domain={ domain } />

				<Card>
					<Property label={ translate( 'Type', { context: 'A type of domain.' } ) }>
						{ translate( 'Incoming Domain Transfer' ) }
					</Property>

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

export default connect( null, {
	paymentSettingsClick,
} )( localize( Transfer ) );
