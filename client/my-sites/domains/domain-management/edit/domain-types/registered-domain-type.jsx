/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import { Card } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { withLocalizedMoment } from 'components/localized-moment';
import DomainStatus from '../card/domain-status';
import DomainWarnings from 'my-sites/domains/components/domain-warnings';
import IcannVerificationCard from 'my-sites/domains/domain-management/components/icann-verification';
import { isRecentlyRegistered, isExpiringSoon } from 'lib/domains/utils';
import {
	DOMAIN_EXPIRATION,
	DOMAIN_EXPIRATION_REDEMPTION,
	DOMAIN_RECENTLY_REGISTERED,
} from 'lib/url/support';
import SubscriptionSettings from '../card/subscription-settings';
import { recordPaymentSettingsClick } from '../payment-settings-analytics';
import { getProductBySlug } from 'state/products-list/selectors';
import {
	getByPurchaseId,
	isFetchingSitePurchases,
	hasLoadedSitePurchasesFromServer,
} from 'state/purchases/selectors';
import NonPrimaryDomainPlanUpsell from '../../components/domain/non-primary-domain-plan-upsell';
import RenewButton from 'my-sites/domains/domain-management/edit/card/renew-button';
import AutoRenewToggle from 'me/purchases/manage-purchase/auto-renew-toggle';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { shouldRenderExpiringCreditCard } from 'lib/purchases';
import ExpiringCreditCard from '../card/notices/expiring-credit-card';
import ExpiringSoon from '../card/notices/expiring-soon';
import DomainManagementNavigation from '../navigation';
import DomainManagementNavigationEnhanced from '../navigation/enhanced';
import { WrapDomainStatusButtons } from './helpers';
import OutboundTransferConfirmation from '../../components/outbound-transfer-confirmation';

class RegisteredDomainType extends React.Component {
	resolveStatus() {
		const { domain, translate, purchase, moment } = this.props;
		const { registrationDate, expiry } = domain;

		if ( domain.pendingTransfer ) {
			return {
				statusText: translate( 'Outbound transfer initiated' ),
				statusClass: 'status-error',
				icon: 'cached',
			};
		}

		if ( purchase && shouldRenderExpiringCreditCard( purchase ) ) {
			return {
				statusText: translate( 'Action required' ),
				statusClass: 'status-error',
				icon: 'info',
			};
		}

		if ( domain.isPendingIcannVerification && domain.currentUserCanManage ) {
			return {
				statusText: translate( 'Action required' ),
				statusClass: 'status-error',
				icon: 'info',
			};
		}

		if ( isExpiringSoon( domain, 30 ) ) {
			const expiresMessage = translate( 'Expires in %(days)s', {
				args: { days: moment.utc( expiry ).fromNow( true ) },
			} );

			if ( isExpiringSoon( domain, 5 ) ) {
				return {
					statusText: expiresMessage,
					statusClass: 'status-error',
					icon: 'info',
				};
			}

			return {
				statusText: expiresMessage,
				statusClass: 'status-warning',
				icon: 'info',
			};
		}

		if ( domain.expired ) {
			return {
				statusText: translate( 'Action required' ),
				statusClass: 'status-error',
				icon: 'info',
			};
		}

		const recentlyRegistered = isRecentlyRegistered( registrationDate );

		if ( recentlyRegistered ) {
			return {
				statusText: translate( 'Activating' ),
				statusClass: 'status-pending',
				icon: 'cloud_upload',
			};
		}

		return {
			statusText: translate( 'Active' ),
			statusClass: 'status-success',
			icon: 'check_circle',
		};
	}

	renderExpired() {
		const { domain, purchase, translate, moment } = this.props;
		const domainsLink = link => <a href={ link } target="_blank" rel="noopener noreferrer" />;

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
						days: moment.utc( domain.renewableUntil ).fromNow( true ),
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
						days: moment.utc( domain.redeemableUntil ).fromNow( true ),
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
					},
				}
			);
		}

		return (
			<div>
				<p>{ message }</p>
				{ domain.currentUserCanManage && ( domain.isRenewable || domain.isRedeemable ) && (
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

		if ( ! recentlyRegistered || domain.pendingTransfer ) {
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

	renderOutboundTransferInProgress() {
		const { domain, selectedSite } = this.props;
		return <OutboundTransferConfirmation domain={ domain } siteId={ selectedSite.ID } />;
	}

	renderDefaultRenewButton() {
		const { domain, purchase } = this.props;

		if ( ! domain.currentUserCanManage ) {
			return null;
		}

		if ( domain.expired || isExpiringSoon( domain, 30 ) ) {
			return null;
		}

		return (
			<div>
				<RenewButton
					compact={ true }
					purchase={ purchase }
					selectedSite={ this.props.selectedSite }
					subscriptionId={ parseInt( domain.subscriptionId, 10 ) }
					tracksProps={ { source: 'registered-domain-status', domain_status: 'active' } }
				/>
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
				compact={ true }
				withTextStatus={ true }
				toggleSource="registered-domain-status"
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
				ruleWhiteList={ [
					'pendingGSuiteTosAcceptanceDomains',
					'newTransfersWrongNS',
					'pendingConsent',
				] }
			/>
		);
	}

	handlePaymentSettingsClick = () => {
		this.props.recordPaymentSettingsClick( this.props.domain );
	};

	render() {
		const { domain, selectedSite, purchase, isLoadingPurchase, moment } = this.props;
		const { name: domain_name } = domain;

		const { statusText, statusClass, icon } = this.resolveStatus();

		const newStatusDesignAutoRenew = config.isEnabled( 'domains/new-status-design/auto-renew' );
		const newDomainManagementNavigation = config.isEnabled(
			'domains/new-status-design/new-options'
		);

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
					<ExpiringSoon selectedSite={ selectedSite } purchase={ purchase } domain={ domain } />
					{ this.renderExpired() }
					{ this.renderRecentlyRegistered() }
					{ this.renderOutboundTransferInProgress() }
				</DomainStatus>
				<Card compact={ true } className="domain-types__expiration-row">
					<div>
						{ domain.expired
							? this.props.translate( 'Expired: %(expiry_date)s', {
									args: {
										expiry_date: moment( domain.expiry ).format( 'LL' ),
									},
							  } )
							: this.props.translate( 'Expires: %(expiry_date)s', {
									args: {
										expiry_date: moment( domain.expiry ).format( 'LL' ),
									},
							  } ) }
					</div>
					{ this.renderDefaultRenewButton() }
					{ ! newStatusDesignAutoRenew && domain.currentUserCanManage && (
						<WrapDomainStatusButtons>
							<SubscriptionSettings
								type={ domain.type }
								compact={ true }
								subscriptionId={ domain.subscriptionId }
								siteSlug={ this.props.selectedSite.slug }
								onClick={ this.handlePaymentSettingsClick }
							/>
						</WrapDomainStatusButtons>
					) }
					{ newStatusDesignAutoRenew && domain.currentUserCanManage && this.renderAutoRenew() }
				</Card>
				{ newDomainManagementNavigation ? (
					<DomainManagementNavigationEnhanced
						domain={ domain }
						selectedSite={ this.props.selectedSite }
						purchase={ purchase }
						isLoadingPurchase={ isLoadingPurchase }
					/>
				) : (
					<DomainManagementNavigation
						domain={ domain }
						selectedSite={ this.props.selectedSite }
						purchase={ purchase }
						isLoadingPurchase={ isLoadingPurchase }
					/>
				) }
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
			redemptionProduct: getProductBySlug( state, 'domain_redemption' ),
		};
	},
	{
		recordPaymentSettingsClick,
	}
)( withLocalizedMoment( localize( RegisteredDomainType ) ) );
