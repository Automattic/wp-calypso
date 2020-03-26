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

class TransferInDomainType extends React.Component {
	getVerticalNavigation() {
		return <VerticalNav>{ /* TODO */ }</VerticalNav>;
	}

	resolveStatus() {
		const { domain, translate } = this.props;

		if ( domain.transferStatus === transferStatus.PENDING_START ) {
			return {
				statusText: translate( 'Action required' ),
				statusClass: 'status-error',
				icon: 'info',
			};
		}

		return {
			statusText: translate( 'Active' ),
			statusClass: 'status-success',
			icon: 'check_circle',
		};
	}

	startTransfer = () => {
		const { domain, selectedSite } = this.props;
		page( domainManagementTransferInPrecheck( selectedSite.slug, domain.name ) );
	};

	renderPendingStart() {
		const { domain, translate } = this.props;

		return (
			<div>
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
			</div>
		);
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
					{ domain.transferStatus === transferStatus.PENDING_START && this.renderPendingStart() }
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
