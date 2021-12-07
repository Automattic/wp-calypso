import { Card } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { resolveDomainStatus } from 'calypso/lib/domains';
import { isRecentlyRegistered, isExpiringSoon } from 'calypso/lib/domains/utils';
import { hasPendingGSuiteUsers } from 'calypso/lib/gsuite';
import { shouldRenderExpiringCreditCard } from 'calypso/lib/purchases';
import {
	DOMAIN_EXPIRATION,
	DOMAIN_EXPIRATION_REDEMPTION,
	DOMAIN_RECENTLY_REGISTERED,
} from 'calypso/lib/url/support';
import AutoRenewToggle from 'calypso/me/purchases/manage-purchase/auto-renew-toggle';
import DomainWarnings from 'calypso/my-sites/domains/components/domain-warnings';
import PendingGSuiteTosNotice from 'calypso/my-sites/domains/components/domain-warnings/pending-gsuite-tos-notice';
import IcannVerificationCard from 'calypso/my-sites/domains/domain-management/components/icann-verification';
import RenewButton from 'calypso/my-sites/domains/domain-management/edit/card/renew-button';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import {
	getByPurchaseId,
	isFetchingSitePurchases,
	hasLoadedSitePurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import getSiteIsDomainOnly from 'calypso/state/selectors/is-domain-only-site';
import NonPrimaryDomainPlanUpsell from '../../components/domain/non-primary-domain-plan-upsell';
import OutboundTransferConfirmation from '../../components/outbound-transfer-confirmation';
import DomainStatus from '../card/domain-status';
import ExpiringCreditCard from '../card/notices/expiring-credit-card';
import ExpiringSoon from '../card/notices/expiring-soon';
import DomainOnlyNotice from '../domain-only-notice';
import DomainManagementNavigationEnhanced from '../navigation/enhanced';
import { recordPaymentSettingsClick } from '../payment-settings-analytics';
import { DomainExpiryOrRenewal, WrapDomainStatusButtons } from './helpers';

class RegisteredDomainType extends Component {
	renderExpired() {
		const { domain, purchase, isLoadingPurchase, translate, moment } = this.props;
		const domainsLink = ( link ) => <a href={ link } target="_blank" rel="noopener noreferrer" />;

		if ( ! domain.expired || domain.pendingTransfer ) {
			return null;
		}

		let message;

		const redemptionCost = this.props.redemptionProduct
			? formatCurrency(
					this.props.redemptionProduct.cost,
					this.props.redemptionProduct.currency_code,
					{ stripZeros: true }
			  )
			: null;

		if ( ! domain.currentUserCanManage ) {
			message = translate(
				'{{strong}}The domain has expired{{/strong}} and is no longer active. Please contact the domain owner %(owner)s to restore it. {{domainsLink}}Learn more{{/domainsLink}}',
				{
					components: {
						strong: <strong />,
						domainsLink: domainsLink( DOMAIN_EXPIRATION ),
					},
					args: {
						owner: domain.owner,
					},
				}
			);
		} else if ( domain.isRenewable ) {
			message = translate(
				'{{strong}}Your domain has expired{{/strong}} and is no longer active. You have {{strong}}%(days)s{{/strong}} to renew it at the standard rate before an additional %(redemptionCost)s redemption fee is applied. {{domainsLink}}Learn more{{/domainsLink}}',
				{
					components: {
						domainsLink: domainsLink( DOMAIN_EXPIRATION ),
						strong: <strong />,
					},
					args: {
						days: moment( domain.renewableUntil ).fromNow( true ),
						redemptionCost: redemptionCost,
					},
				}
			);
		} else if ( domain.isRedeemable ) {
			message = translate(
				'{{strong}}Your domain has expired{{/strong}} and is no longer active. You have {{strong}}%(days)s{{/strong}} to reactivate it during this redemption period before someone else can register it. An additional redemption fee of {{strong}}%(redemptionCost)s{{/strong}} will be added to the price of the domain to reactivate it. {{domainsLink}}Learn more{{/domainsLink}}',
				{
					components: {
						domainsLink: domainsLink( DOMAIN_EXPIRATION_REDEMPTION ),
						strong: <strong />,
					},
					args: {
						days: moment( domain.redeemableUntil ).fromNow( true ),
						redemptionCost: redemptionCost,
					},
				}
			);
		} else {
			message = translate(
				'{{strong}}Your domain has expired{{/strong}} and is no longer active. {{domainsLink}}Learn more{{/domainsLink}}',
				{
					components: {
						domainsLink: domainsLink( DOMAIN_EXPIRATION ),
						strong: <strong />,
					},
				}
			);
		}

		return (
			<div>
				<p>{ message }</p>
				{ domain.currentUserCanManage &&
					( isLoadingPurchase || purchase ) &&
					( domain.isRenewable || domain.isRedeemable ) && (
						<RenewButton
							primary={ true }
							purchase={ purchase }
							selectedSite={ this.props.selectedSite }
							subscriptionId={ parseInt( domain.subscriptionId, 10 ) }
							redemptionProduct={ domain.isRedeemable ? this.props.redemptionProduct : null }
							reactivate={ ! domain.isRenewable && domain.isRedeemable }
							tracksProps={ { source: 'registered-domain-status', domain_status: 'expired' } }
						/>
					) }
			</div>
		);
	}

	renderRecentlyRegistered() {
		const { domain, translate } = this.props;
		const { registrationDate, name: domain_name } = domain;
		const domainsLink = (
			<a href={ DOMAIN_RECENTLY_REGISTERED } target="_blank" rel="noopener noreferrer" />
		);

		const recentlyRegistered = isRecentlyRegistered( registrationDate );

		if ( ! recentlyRegistered || domain.pendingTransfer || domain.isPendingIcannVerification ) {
			return null;
		}

		return (
			<div>
				{ translate(
					'We are setting up {{strong}}%(domain)s{{/strong}} for you. It should start working immediately but may be unreliable in the first 30 minutes. {{domainsLink}}Learn more{{/domainsLink}}',
					{
						args: {
							domain: domain_name,
						},
						components: {
							domainsLink,
							strong: <strong />,
						},
					}
				) }
			</div>
		);
	}

	renderDomainOnlyNotice() {
		const { domain, selectedSite, isDomainOnlySite } = this.props;
		if ( isDomainOnlySite ) {
			return <DomainOnlyNotice domain={ domain } selectedSiteSlug={ selectedSite.slug } />;
		}

		return null;
	}

	renderPendingGSuiteTosNotice() {
		const { domain, purchase, selectedSite } = this.props;

		if (
			! hasPendingGSuiteUsers( domain ) ||
			domain.pendingTransfer ||
			domain.expired ||
			domain.isPendingIcannVerification ||
			isExpiringSoon( domain, 30 ) ||
			isRecentlyRegistered( domain ) ||
			( purchase && shouldRenderExpiringCreditCard( purchase ) )
		) {
			return null;
		}

		return (
			<PendingGSuiteTosNotice
				siteSlug={ selectedSite.slug }
				domains={ [ domain ] }
				section="domain-management"
				showDomainStatusNotice
			/>
		);
	}

	renderOutboundTransferInProgress() {
		const { domain, selectedSite } = this.props;
		return <OutboundTransferConfirmation domain={ domain } siteId={ selectedSite.ID } />;
	}

	renderDefaultRenewButton() {
		const { domain, purchase, isLoadingPurchase } = this.props;

		if ( domain.isPendingRenewal ) {
			return null;
		}

		if ( ! domain.currentUserCanManage ) {
			return null;
		}

		if ( domain.expired || isExpiringSoon( domain, 30 ) ) {
			return null;
		}

		return (
			<div>
				{ ( isLoadingPurchase || purchase ) && (
					<RenewButton
						compact={ true }
						purchase={ purchase }
						selectedSite={ this.props.selectedSite }
						subscriptionId={ parseInt( domain.subscriptionId, 10 ) }
						tracksProps={ { source: 'registered-domain-status', domain_status: 'active' } }
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
				withTextStatus={ true }
				toggleSource="registered-domain-status"
			/>
		);

		return (
			content && (
				<WrapDomainStatusButtons className="domain-types__auto-renew-wrapper">
					{ content }
				</WrapDomainStatusButtons>
			)
		);
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

	planUpsellForNonPrimaryDomain() {
		const { domain } = this.props;

		return (
			<NonPrimaryDomainPlanUpsell
				tracksImpressionName="calypso_non_primary_domain_settings_plan_upsell_impression"
				tracksClickName="calypso_non_primary_domain_settings_plan_upsell_click"
				domain={ domain }
			/>
		);
	}

	domainWarnings() {
		return (
			<DomainWarnings
				domain={ this.props.domain }
				position="registered-domain"
				selectedSite={ this.props.selectedSite }
				allowedRules={ [ 'newTransfersWrongNS', 'pendingConsent' ] }
			/>
		);
	}

	handlePaymentSettingsClick = () => {
		this.props.recordPaymentSettingsClick( this.props.domain );
	};

	render() {
		const { domain, selectedSite, purchase, isLoadingPurchase, isDomainOnlySite } = this.props;
		const { name: domain_name } = domain;

		const { statusText, statusClass, icon } = resolveDomainStatus( domain, purchase, {
			isDomainOnlySite,
		} );

		return (
			<div className="domain-types__container">
				{ selectedSite.ID && ! purchase && <QuerySitePurchases siteId={ selectedSite.ID } /> }
				{ this.planUpsellForNonPrimaryDomain() }
				{ this.domainWarnings() }
				<DomainStatus
					header={ domain_name }
					statusText={ statusText }
					statusClass={ statusClass }
					icon={ icon }
					premium={ domain.isPremium }
				>
					{ domain.isPendingIcannVerification && domain.currentUserCanManage && (
						<IcannVerificationCard
							selectedDomainName={ domain.name }
							selectedSiteSlug={ this.props.selectedSite.slug }
							explanationContext="new-status"
							compact={ true }
						/>
					) }
					<ExpiringCreditCard
						selectedSite={ selectedSite }
						purchase={ purchase }
						domain={ domain }
					/>
					<ExpiringSoon
						selectedSite={ selectedSite }
						purchase={ purchase }
						isLoadingPurchase={ isLoadingPurchase }
						domain={ domain }
					/>
					{ this.renderExpired() }
					{ this.renderRecentlyRegistered() }
					{ this.renderOutboundTransferInProgress() }
					{ this.renderDomainOnlyNotice() }
					{ this.renderPendingGSuiteTosNotice() }
				</DomainStatus>
				<Card compact={ true } className="domain-types__expiration-row">
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
			isDomainOnlySite: getSiteIsDomainOnly( state, ownProps.selectedSite.ID ),
			isLoadingPurchase:
				isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state ),
			purchase: purchase && purchase.userId === currentUserId ? purchase : null,
			redemptionProduct: getProductBySlug( state, 'domain_redemption' ),
		};
	},
	{
		recordPaymentSettingsClick,
	}
)( withLocalizedMoment( localize( RegisteredDomainType ) ) );
