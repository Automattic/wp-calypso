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
import Button from 'components/button';
import Card from 'components/card/compact';
import Header from './card/header';
import Property from './card/property';
import SubscriptionSettings from './card/subscription-settings';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { transferStatus } from 'lib/domains/constants';
import support from 'lib/url/support';
import { restartInboundTransfer } from 'lib/domains';
import { fetchDomains } from 'lib/upgrades/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import { cancelPurchase as cancelPurchaseLink } from 'me/purchases/paths';

class Transfer extends React.PureComponent {
	render() {
		const { domain } = this.props;
		let content = this.getDomainDetailsCard();

		if ( domain.transferStatus === transferStatus.CANCELLED ) {
			content = this.getCancelledContent();
		}

		const path = cancelPurchaseLink( this.props.selectedSite.slug, domain.subscriptionId );

		return (
			<div className="edit__domain-details-card">
				<Header domain={ domain } />
				{ content }
				<VerticalNav>
					<VerticalNavItem path={ path }>
						{ this.props.translate( 'Cancel Transfer' ) }
					</VerticalNavItem>
				</VerticalNav>
			</div>
		);
	}

	handlePaymentSettingsClick = () => {
		this.props.paymentSettingsClick( this.props.domain );
	};

	restartTransfer = () => {
		const { domain, selectedSite, translate } = this.props;

		restartInboundTransfer( selectedSite.ID, domain.name, ( error, result ) => {
			if ( result ) {
				this.props.successNotice( translate( 'The transfer has been successfully restarted.' ), {
					duration: 5000,
				} );
				fetchDomains( selectedSite.ID );
			} else {
				this.props.errorNotice(
					error.message || translate( 'We were unable to restart the transfer.' ),
					{
						duration: 5000,
					}
				);
			}
		} );
	};

	getCancelledContent() {
		const { domain, translate } = this.props;

		return (
			<Card>
				<div>
					<p className="edit__transfer-text-fail">{ translate( 'Domain transfer failed' ) }</p>
					<p>
						{ translate(
							'We were unable to verify the transfer of {{strong}}%(domain)s{{/strong}}. The domain ' +
								'authorization code from you current registrar was not provided to initiate the transfer. ' +
								'{{a}}Learn More{{/a}}.',
							{
								components: {
									strong: <strong />,
									a: <a href={ '#' } />,
								},
								args: { domain: domain.name },
							}
						) }
					</p>
				</div>
				<div>
					<Button onClick={ this.restartTransfer }>
						{ this.props.translate( 'Start Transfer Again' ) }
					</Button>
					<Button className="edit__transfer-button-margin" href={ support.CALYPSO_CONTACT }>
						{ this.props.translate( 'Contact Support' ) }
					</Button>
				</div>
			</Card>
		);
	}

	getDomainDetailsCard() {
		const { domain, selectedSite, translate } = this.props;

		return (
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
	errorNotice,
	paymentSettingsClick,
	successNotice,
} )( localize( Transfer ) );
