/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import { withLocalizedMoment } from 'components/localized-moment';
import DomainStatus from '../card/domain-status';
import QuerySitePurchases from 'components/data/query-site-purchases';
import {
	getByPurchaseId,
	isFetchingSitePurchases,
	hasLoadedSitePurchasesFromServer,
} from 'state/purchases/selectors';
import { transferStatus } from 'lib/domains/constants';
import page from 'page';
import { domainManagementTransferInPrecheck } from 'my-sites/domains/paths';
import { isCancelable } from 'lib/purchases';
import { cancelPurchase } from 'me/purchases/paths';
import RemovePurchase from 'me/purchases/remove-purchase';

class TransferInDomainType extends React.Component {
	getVerticalNavigation() {
		return <VerticalNav>{ this.removeTransferNavItem() }</VerticalNav>;
	}

	removeTransferNavItem() {
		const { domain, isLoadingPurchase, purchase, selectedSite, translate } = this.props;

		if ( ! domain.currentUserCanManage ) {
			return null;
		}

		if (
			domain.transferStatus === transferStatus.PENDING_OWNER ||
			domain.transferStatus === transferStatus.PENDING_REGISTRY
		) {
			return null;
		}

		let title;

		if ( domain.transferStatus === transferStatus.CANCELLED ) {
			title = translate( 'Remove transfer from your account' );
		} else {
			title = translate( 'Cancel transfer' );
		}

		if ( isLoadingPurchase ) {
			return <VerticalNavItem isPlaceholder />;
		}

		if ( ! selectedSite || ! purchase ) {
			return null;
		}

		if ( isCancelable( purchase ) ) {
			const link = cancelPurchase( selectedSite.slug, purchase.id );

			return <VerticalNavItem path={ link }>{ title }</VerticalNavItem>;
		}

		return (
			<RemovePurchase
				hasLoadedSites={ true }
				hasLoadedUserPurchasesFromServer={ true }
				site={ selectedSite }
				purchase={ purchase }
				title={ title }
				hideTrashIcon={ true }
				displayButtonAsLink={ true }
			/>
		);
	}

	resolveStatus() {
		const { domain, translate } = this.props;
		const { transferStatus: status } = domain;

		if ( status === transferStatus.PENDING_START ) {
			return {
				statusText: translate( 'Action required' ),
				statusClass: 'status-error',
				icon: 'info',
			};
		} else if ( status === transferStatus.CANCELLED ) {
			return {
				statusText: translate( 'Transfer failed' ),
				statusClass: 'status-error',
				icon: 'info',
			};
		}

		return {
			statusText: translate( 'Transfer in progress' ),
			statusClass: 'status-success',
			icon: 'cached',
		};
	}

	startTransfer = () => {
		const { domain, selectedSite } = this.props;
		page( domainManagementTransferInPrecheck( selectedSite.slug, domain.name ) );
	};

	renderPendingStart() {
		const { domain, translate } = this.props;

		return (
			<>
				<p>
					{ translate(
						'We need you to complete a couple of steps before we can transfer %(domain)s from your ' +
							'current domain provider to WordPress.com. Your domain will stay at your current provider ' +
							'until the transfer is completed.',
						{
							args: {
								domain: domain.name,
							},
						}
					) }
				</p>

				<Button primary onClick={ this.startTransfer }>
					{ translate( 'Start Transfer' ) }
				</Button>
			</>
		);
	}

	renderTransferInProgress() {
		const { translate } = this.props;

		return (
			<p>
				{ translate(
					'Your transfer has been started and is waiting for authorization from your current ' +
						'domain provider. This process can take up to 7 days. If you need to cancel or expedite the ' +
						'transfer please contact them for assistance.'
				) }
			</p>
		);
	}

	renderTransferFailed() {
		// TODO
		return null;
	}

	renderStatusBody( domainStatus ) {
		if ( domainStatus === transferStatus.PENDING_START ) {
			return this.renderPendingStart();
		} else if ( domainStatus === transferStatus.CANCELLED ) {
			return this.renderTransferFailed();
		}

		return this.renderTransferInProgress();
	}

	render() {
		const { domain, selectedSite, purchase } = this.props;
		const { name: domain_name } = domain;

		const { statusText, statusClass, icon } = this.resolveStatus();

		return (
			<div className="domain-types__container">
				{ selectedSite.ID && ! purchase && <QuerySitePurchases siteId={ selectedSite.ID } /> }
				<DomainStatus
					header={ domain_name }
					statusText={ statusText }
					statusClass={ statusClass }
					icon={ icon }
				>
					{ this.renderStatusBody( domain.transferStatus ) }
				</DomainStatus>
				{ this.getVerticalNavigation() }
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const { subscriptionId } = ownProps.domain;
	return {
		purchase: subscriptionId ? getByPurchaseId( state, parseInt( subscriptionId, 10 ) ) : null,
		isLoadingPurchase:
			isFetchingSitePurchases( state ) && ! hasLoadedSitePurchasesFromServer( state ),
	};
} )( withLocalizedMoment( localize( TransferInDomainType ) ) );
