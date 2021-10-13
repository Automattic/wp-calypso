import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import page from 'page';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { resolveDomainStatus, startInboundTransfer } from 'calypso/lib/domains';
import { transferStatus } from 'calypso/lib/domains/constants';
import { INCOMING_DOMAIN_TRANSFER_STATUSES } from 'calypso/lib/url/support';
import { domainManagementTransferIn } from 'calypso/my-sites/domains/paths';
import { errorNotice } from 'calypso/state/notices/actions';
import {
	getByPurchaseId,
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import DomainStatus from '../card/domain-status';
import DomainManagementNavigationEnhanced from '../navigation/enhanced';

class TransferInDomainType extends Component {
	startTransfer = () => {
		this.setState( { isTransferring: true }, this.inboundTransfer );
	};

	inboundTransfer() {
		const { domain, selectedSite, translate } = this.props;
		const domainName = domain.name;

		startInboundTransfer( selectedSite.ID, domainName, null, ( error, result ) => {
			this.setState( { isTransferring: false } );
			if ( result ) {
				this.props.fetchSiteDomains( selectedSite.ID );
				page( domainManagementTransferIn( selectedSite.slug, domainName ) );
			} else {
				this.props.errorNotice( translate( 'We were unable to start the transfer.' ) );
			}
		} );
	}

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

				<Button primary onClick={ this.startTransfer } busy={ this.state?.isTransferring }>
					{ translate( 'Start transfer' ) }
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
		const { domain, translate } = this.props;

		return (
			<>
				<p>
					{ translate(
						'We were unable to complete the transfer of {{strong}}%(domain)s{{/strong}}. ' +
							'You can remove the transfer from your account or try to start the transfer again. ' +
							'{{a}}Learn more{{/a}}',
						{
							args: {
								domain: domain.name,
							},
							components: {
								strong: <strong />,
								a: (
									<a
										href={ INCOMING_DOMAIN_TRANSFER_STATUSES }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
				</p>

				<Button onClick={ this.startTransfer }>{ translate( 'Start transfer again' ) }</Button>
			</>
		);
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
		const { domain, selectedSite, purchase, isLoadingPurchase } = this.props;
		const { name: domain_name } = domain;

		const { statusText, statusClass, icon } = resolveDomainStatus( domain, purchase );

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
				<DomainManagementNavigationEnhanced
					domain={ domain }
					selectedSite={ selectedSite }
					purchase={ purchase }
					isLoadingPurchase={ isLoadingPurchase }
				/>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const { subscriptionId } = ownProps.domain;
		return {
			purchase: subscriptionId ? getByPurchaseId( state, parseInt( subscriptionId, 10 ) ) : null,
			isLoadingPurchase:
				isFetchingSitePurchases( state ) && ! hasLoadedSitePurchasesFromServer( state ),
		};
	},
	{
		errorNotice,
	}
)( withLocalizedMoment( localize( TransferInDomainType ) ) );
