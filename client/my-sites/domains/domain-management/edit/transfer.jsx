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
import { Button, Card } from '@automattic/components';
import { withLocalizedMoment } from 'components/localized-moment';
import Header from './card/header';
import Property from './card/property';
import SubscriptionSettings from './card/subscription-settings';
import { transferStatus } from 'lib/domains/constants';
import { fetchSiteDomains } from 'state/sites/domains/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import { cancelPurchase as cancelPurchaseLink } from 'me/purchases/paths';
import { Notice } from 'components/notice';
import { get } from 'lodash';
import InboundTransferEmailVerificationCard from 'my-sites/domains/domain-management/components/inbound-transfer-verification';
import { domainManagementTransferInPrecheck } from 'my-sites/domains/paths';
import { recordPaymentSettingsClick } from './payment-settings-analytics';
import { localizeUrl } from 'lib/i18n-utils';

class Transfer extends React.PureComponent {
	render() {
		const { domain, selectedSite, translate, moment } = this.props;
		const content = this.getDomainDetailsCard();

		let transferNotice;
		let cancelNavItem;
		if ( domain.transferStatus === transferStatus.PENDING_REGISTRY ) {
			transferNotice = (
				<Notice status={ 'is-warning' } showDismiss={ false }>
					{ translate(
						'This transfer has been started and is waiting for authorization from your current provider. ' +
							'If you need to cancel the transfer, please contact them for assistance.'
					) }
				</Notice>
			);

			if ( domain.transferEndDate ) {
				transferNotice = (
					<Notice status={ 'is-warning' } showDismiss={ false }>
						{ translate(
							'This transfer has been started and is waiting for authorization from your current provider. ' +
								'It should complete by %(transferFinishDate)s. ' +
								'If you need to cancel the transfer, please contact them for assistance.',
							{
								args: {
									transferFinishDate: moment( domain.transferEndDate ).format( 'LL' ),
								},
							}
						) }
					</Notice>
				);
			}
		} else if ( domain.transferStatus === transferStatus.CANCELLED ) {
			transferNotice = (
				<Notice status={ 'is-error' } showDismiss={ false }>
					{ translate( 'The transfer has failed. {{a}}Learn more{{/a}}.', {
						components: {
							a: (
								<a
									href={ localizeUrl(
										'https://wordpress.com/support/move-domain/incoming-domain-transfer/#checking-your-transfer-status-and-failed-transfers'
									) }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					} ) }
				</Notice>
			);

			cancelNavItem = (
				<VerticalNav>
					<VerticalNavItem path={ cancelPurchaseLink( selectedSite.slug, domain.subscriptionId ) }>
						{ translate( 'Cancel Transfer' ) }
					</VerticalNavItem>
				</VerticalNav>
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
						<Button className="edit__transfer-button-fail" onClick={ this.startTransfer }>
							{ translate( 'Start Transfer' ) }
						</Button>
					</div>
				</Card>
			);
		}

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="domain-details-card">
				{ this.renderInboundTransferEmailNotice() }
				{ transferNotice }
				<Header domain={ domain } />
				{ content }
				{ cancelNavItem }
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	renderInboundTransferEmailNotice = () => {
		const domain = this.props.domain;
		const isPendingVerification = transferStatus.PENDING_OWNER === get( domain, 'transferStatus' );

		if ( ! isPendingVerification ) {
			return null;
		}

		return (
			<InboundTransferEmailVerificationCard
				domain={ domain }
				selectedSiteSlug={ this.props.selectedSite.slug }
			/>
		);
	};

	handlePaymentSettingsClick = () => {
		this.props.recordPaymentSettingsClick( this.props.domain );
	};

	startTransfer = () => {
		const { domain, selectedSite } = this.props;
		page( domainManagementTransferInPrecheck( selectedSite.slug, domain.name ) );
	};

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

export default connect( null, {
	errorNotice,
	fetchSiteDomains,
	recordPaymentSettingsClick,
	successNotice,
} )( localize( withLocalizedMoment( Transfer ) ) );
