/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import Header from './card/header';
import Property from './card/property';
import SubscriptionSettings from './card/subscription-settings';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { transferStatus } from 'lib/domains/constants';
import {
	CALYPSO_CONTACT,
	INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS,
	INCOMING_DOMAIN_TRANSFER_STATUSES_FAILED,
} from 'lib/url/support';
import { restartInboundTransfer } from 'lib/domains';
import { fetchDomains } from 'lib/upgrades/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import { cancelPurchase as cancelPurchaseLink } from 'me/purchases/paths';
import { Notice } from 'components/notice';
import { domainManagementTransferInPrecheck } from 'my-sites/domains/paths';

class Transfer extends React.PureComponent {
	state = {
		isSubmitting: false,
	};

	render() {
		const { domain, selectedSite, translate } = this.props;
		const { isSubmitting } = this.state;
		let content = this.getDomainDetailsCard();

		if ( domain.transferStatus === transferStatus.CANCELLED ) {
			content = this.getCancelledContent();
		}

		let transferNotice;
		let cancelNavItem;

		if ( domain.transferStatus === transferStatus.PENDING_OWNER ) {
			transferNotice = (
				<Notice status={ 'is-warning' } showDismiss={ false }>
					{ translate(
						'Your registrar will send an email to confirm the transfer of {{strong}}%(domain)s{{/strong}}. ' +
							'Please confirm in 5 days or the transfer will be canceled. ' +
							'{{learnMoreLink}}Learn more.{{/learnMoreLink}}',
						{
							args: {
								domain: domain.name,
							},
							components: {
								learnMoreLink: (
									<a
										href={ INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS }
										rel="noopener noreferrer"
										target="_blank"
									/>
								),
								strong: <strong />,
							},
						}
					) }{' '}
					}
				</Notice>
			);
		}

		if ( domain.transferStatus === transferStatus.PENDING_REGISTRY ) {
			transferNotice = (
				<Notice status={ 'is-info' } showDismiss={ false }>
					{ translate(
						'This transfer has been started and is waiting for authorization from your current provider. ' +
							'If you need to cancel the transfer, please contact them for assistance.'
					) }
				</Notice>
			);
		} else {
			cancelNavItem = (
				<VerticalNav>
					<VerticalNavItem path={ cancelPurchaseLink( selectedSite.slug, domain.subscriptionId ) }>
						{ translate( 'Cancel Transfer' ) }
					</VerticalNavItem>
				</VerticalNav>
			);
		}

		if ( domain.transferStatus === transferStatus.PENDING_START ) {
			transferNotice = (
				<Card compact={ false } highlight={ 'warning' }>
					<div>
						<h2 className="edit__transfer-text-fail">
							{ translate(
								'Important: Finish Moving {{strong}}%(domain)s{{/strong}} to WordPress.com',
								{
									components: {
										strong: <strong />,
									},
									args: { domain: domain.name },
								}
							) }
						</h2>
						<p>
							{ translate(
								'Start the transfer to get your domain {{strong}}%(domain)s{{/strong}} moved to WordPress.com. ' +
									'Your domain will stay at your current provider until the transfer is complete.',
								{
									components: {
										strong: <strong />,
									},
									args: { domain: domain.name },
								}
							) }
						</p>
					</div>
					<div>
						<Button
							className="edit__transfer-button-fail"
							onClick={ this.startTransfer }
							busy={ isSubmitting }
							disabled={ isSubmitting }
						>
							{ isSubmitting ? translate( 'Starting Transfer…' ) : translate( 'Start Transfer' ) }
						</Button>
					</div>
				</Card>
			);
		}

		return (
			<div className="edit__domain-details-card">
				{ transferNotice }
				<Header domain={ domain } />
				{ content }
				{ cancelNavItem }
			</div>
		);
	}

	handlePaymentSettingsClick = () => {
		this.props.paymentSettingsClick( this.props.domain );
	};

	startTransfer = () => {
		const { domain, selectedSite } = this.props;
		page( domainManagementTransferInPrecheck( selectedSite.slug, domain.name ) );
	};

	restartTransfer = () => {
		const { domain, selectedSite, translate } = this.props;
		this.toggleSubmittingState();

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
				this.toggleSubmittingState();
			}
		} );
	};

	toggleSubmittingState() {
		this.setState( { isSubmitting: ! this.state.isSubmitting } );
	}

	getCancelledContent() {
		const { domain, translate } = this.props;
		const { isSubmitting } = this.state;

		return (
			<Card>
				<div>
					<h2 className="edit__transfer-text-fail">{ translate( 'Domain transfer failed' ) }</h2>
					<p>
						{ translate(
							'We were unable to complete the transfer of {{strong}}%(domain)s{{/strong}}. It could be ' +
								'a number of things that caused the transfer to fail like an invalid or missing authorization code, ' +
								'the domain is still locked, or your current domain provider denied the transfer. ' +
								'{{a}}Visit our support article{{/a}} for more detailed information about why it may have failed.',
							{
								components: {
									strong: <strong />,
									a: (
										<a
											href={ INCOMING_DOMAIN_TRANSFER_STATUSES_FAILED }
											rel="noopener noreferrer"
											target="_blank"
										/>
									),
								},
								args: { domain: domain.name },
							}
						) }
					</p>
				</div>
				<div>
					<Button
						className="edit__transfer-button-fail"
						onClick={ this.restartTransfer }
						busy={ isSubmitting }
						disabled={ isSubmitting }
					>
						{ isSubmitting
							? translate( 'Restarting Transfer…' )
							: translate( 'Start Transfer Again' ) }
					</Button>
					<Button
						className="edit__transfer-button-fail edit__transfer-button-fail-margin"
						href={ CALYPSO_CONTACT }
					>
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
