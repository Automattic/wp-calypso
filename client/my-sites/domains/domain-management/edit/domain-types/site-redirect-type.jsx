/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import DomainStatus from '../card/domain-status';
import { recordPaymentSettingsClick } from '../payment-settings-analytics';
import {
	getByPurchaseId,
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import RenewButton from 'calypso/my-sites/domains/domain-management/edit/card/renew-button';
import AutoRenewToggle from 'calypso/me/purchases/manage-purchase/auto-renew-toggle';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import ExpiringCreditCard from '../card/notices/expiring-credit-card';
import DomainManagementNavigationEnhanced from '../navigation/enhanced';
import { DomainExpiryOrRenewal, WrapDomainStatusButtons } from './helpers';
import { resolveDomainStatus } from 'calypso/lib/domains';

class SiteRedirectType extends React.Component {
	renderDefaultRenewButton() {
		const { domain, purchase, isLoadingPurchase } = this.props;

		if ( ! domain.currentUserCanManage ) {
			return null;
		}

		return (
			<div>
				{ ( isLoadingPurchase || purchase ) && (
					<RenewButton
						compact
						purchase={ purchase }
						selectedSite={ this.props.selectedSite }
						subscriptionId={ parseInt( domain.subscriptionId, 10 ) }
						tracksProps={ { source: 'site-redirect-url', domain_status: domain.name } }
					/>
				) }
			</div>
		);
	}

	renderAutoRenewToggle() {
		const { selectedSite, purchase } = this.props;

		if ( ! purchase ) {
			return null;
		}

		const content = (
			<AutoRenewToggle
				planName={ selectedSite.plan.product_name_short }
				siteDomain={ selectedSite.domain }
				purchase={ purchase }
				withTextStatus
				toggleSource="site-redirect-status"
			/>
		);

		return content && <WrapDomainStatusButtons>{ content }</WrapDomainStatusButtons>;
	}

	renderAutoRenew() {
		const { isLoadingPurchase } = this.props;

		if ( isLoadingPurchase ) {
			return (
				<WrapDomainStatusButtons className="domain-types__auto-renew-placeholder">
					<p />
				</WrapDomainStatusButtons>
			);
		}

		return this.renderAutoRenewToggle();
	}

	handlePaymentSettingsClick = () => {
		this.props.recordPaymentSettingsClick( this.props.domain );
	};

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
					<ExpiringCreditCard
						selectedSite={ selectedSite }
						purchase={ purchase }
						domain={ domain }
					/>
				</DomainStatus>
				<Card compact className="domain-types__expiration-row">
					<DomainExpiryOrRenewal { ...this.props } />
					{ this.renderDefaultRenewButton() }
					{ domain.currentUserCanManage && this.renderAutoRenew() }
				</Card>
				<DomainManagementNavigationEnhanced
					domain={ domain }
					selectedSite={ this.props.selectedSite }
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
		const currentUserId = getCurrentUserId( state );
		const purchase = subscriptionId
			? getByPurchaseId( state, parseInt( subscriptionId, 10 ) )
			: null;

		return {
			purchase: purchase && purchase.userId === currentUserId ? purchase : null,
			isLoadingPurchase:
				isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state ),
		};
	},
	{
		recordPaymentSettingsClick,
	}
)( withLocalizedMoment( localize( SiteRedirectType ) ) );
