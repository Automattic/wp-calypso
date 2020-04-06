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
import { withLocalizedMoment } from 'components/localized-moment';
import DomainStatus from '../card/domain-status';
import { isExpiringSoon } from 'lib/domains/utils';
import SubscriptionSettings from '../card/subscription-settings';
import { recordPaymentSettingsClick } from '../payment-settings-analytics';
import { WPCOM_DEFAULTS } from 'lib/domains/nameservers';
import AutoRenewToggle from 'me/purchases/manage-purchase/auto-renew-toggle';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { isSubdomain } from 'lib/domains';
import { MAP_EXISTING_DOMAIN, MAP_SUBDOMAIN } from 'lib/url/support';
import RenewButton from 'my-sites/domains/domain-management/edit/card/renew-button';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'state/sites/selectors';
import {
	getByPurchaseId,
	isFetchingSitePurchases,
	hasLoadedSitePurchasesFromServer,
} from 'state/purchases/selectors';
import ExpiringCreditCard from '../card/notices/expiring-credit-card';
import ExpiringSoon from '../card/notices/expiring-soon';
import DomainManagementNavigation from '../navigation';
import { WrapDomainStatusButtons } from './helpers';

class MappedDomainType extends React.Component {
	resolveStatus() {
		const { domain, translate, moment } = this.props;
		const { expiry } = domain;

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

		if (
			! this.props.isJetpackSite &&
			! this.props.isAutomatedTransferSite &&
			! domain.pointsToWpcom
		) {
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

	renderSettingUpNameservers() {
		const { domain, translate } = this.props;
		if ( this.props.isJetpackSite || this.props.isAutomatedTransferSite ) {
			return null;
		}

		if ( domain.pointsToWpcom ) {
			return null;
		}

		const learnMoreLink = linksTo => (
			<a href={ linksTo } target="_blank" rel="noopener noreferrer" />
		);
		let primaryMessage;
		let secondaryMessage;

		if ( isSubdomain( domain.name ) ) {
			primaryMessage = translate(
				'Your subdomain mapping has not been set up. You need to create the correct CNAME or NS records at your current DNS provider. {{learnMoreLink}}Learn how to do that in our support guide for mapping subdomains{{/learnMoreLink}}.',
				{
					components: {
						strong: <strong />,
						learnMoreLink: learnMoreLink( MAP_SUBDOMAIN ),
					},
					args: { domainName: domain.name },
					context: 'Notice for mapped subdomain that has DNS records need to set up',
				}
			);
			secondaryMessage = translate(
				"Please note that it can take up to 72 hours for your changes to become available. If you're still not seeing your site loading at %(domainName)s, please wait a few more hours, clear your browser cache, and try again.",
				{
					args: { domainName: domain.name },
				}
			);
		} else {
			primaryMessage = translate(
				'Your domain mapping has not been set up. You need to update your name servers at the company where you purchased the domain to:',
				{
					context: 'Notice for mapped domain notice with NS records pointing to somewhere else',
				}
			);
			secondaryMessage = translate(
				"Please note that it can take up to 72 hours for your changes to become available. If you're still not seeing your site loading at %(domainName)s, please wait a few more hours, clear your browser cache, and try again. {{learnMoreLink}}Learn all about mapping an existing domain in our support docs{{/learnMoreLink}}.",
				{
					components: { learnMoreLink: learnMoreLink( MAP_EXISTING_DOMAIN ) },
					args: { domainName: domain.name },
				}
			);
		}

		return (
			<React.Fragment>
				<div>
					<p>{ primaryMessage }</p>
					{ ! isSubdomain( domain.name ) && (
						<ul className="mapped-domain-type__name-server-list">
							{ WPCOM_DEFAULTS.map( nameServer => {
								return <li key={ nameServer }>{ nameServer }</li>;
							} ) }
						</ul>
					) }
				</div>
				<div className="mapped-domain-type__small-message">{ secondaryMessage }</div>
			</React.Fragment>
		);
	}

	renderDefaultRenewButton() {
		const { domain, purchase, translate } = this.props;

		if ( domain.expired || isExpiringSoon( domain, 30 ) ) {
			return null;
		}

		let subscriptionId;
		let customLabel;
		let tracksProps;

		if ( domain.bundledPlanSubscriptionId ) {
			subscriptionId = domain.bundledPlanSubscriptionId;
			customLabel = translate( 'Renew your plan' );
			tracksProps = { source: 'mapped-domain-status', mapping_status: 'active-plan' };
		} else {
			subscriptionId = domain.subscriptionId;
			customLabel = null;
			tracksProps = { source: 'mapped-domain-status', mapping_status: 'active' };
		}

		return (
			<div>
				<RenewButton
					compact={ true }
					purchase={ purchase }
					selectedSite={ this.props.selectedSite }
					subscriptionId={ parseInt( subscriptionId, 10 ) }
					customLabel={ customLabel }
					tracksProps={ tracksProps }
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
				toggleSource="mapped-domain-status"
			/>
		);

		return content && <WrapDomainStatusButtons>{ content }</WrapDomainStatusButtons>;
	}

	renderAutoRenew() {
		const { isLoadingPurchase, domain } = this.props;

		if ( domain && domain.bundledPlanSubscriptionId ) {
			return null;
		}

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
		const {
			domain,
			selectedSite,
			purchase,
			mappingPurchase,
			isLoadingPurchase,
			moment,
			translate,
		} = this.props;
		const { name: domain_name } = domain;

		const { statusText, statusClass, icon } = this.resolveStatus();

		const newStatusDesignAutoRenew = config.isEnabled( 'domains/new-status-design/auto-renew' );

		let expiresText;

		if ( ! domain.expiry ) {
			expiresText = translate( 'Expires: Never' );
		} else if ( domain.bundledPlanSubscriptionId ) {
			expiresText = translate( 'Expires with your plan on %(expiry_date)s', {
				args: {
					expiry_date: moment.utc( domain.expiry ).format( 'LL' ),
				},
			} );
		} else {
			expiresText = translate( 'Expires: %(expiry_date)s', {
				args: {
					expiry_date: moment.utc( domain.expiry ).format( 'LL' ),
				},
			} );
		}

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
					{ this.renderSettingUpNameservers() }
					<ExpiringSoon selectedSite={ selectedSite } purchase={ purchase } domain={ domain } />
				</DomainStatus>
				<Card compact={ true } className="domain-types__expiration-row">
					<div>{ expiresText }</div>
					{ this.renderDefaultRenewButton() }
					{ ! newStatusDesignAutoRenew && domain.subscriptionId && (
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
				<DomainManagementNavigation
					domain={ domain }
					selectedSite={ this.props.selectedSite }
					purchase={ mappingPurchase }
					isLoadingPurchase={ isLoadingPurchase }
				/>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const { subscriptionId, bundledPlanSubscriptionId } = ownProps.domain;
		const purchaseSubscriptionId = bundledPlanSubscriptionId
			? bundledPlanSubscriptionId
			: subscriptionId;
		return {
			purchase: purchaseSubscriptionId
				? getByPurchaseId( state, parseInt( purchaseSubscriptionId, 10 ) )
				: null,
			mappingPurchase: subscriptionId
				? getByPurchaseId( state, parseInt( subscriptionId, 10 ) )
				: null,
			isLoadingPurchase:
				isFetchingSitePurchases( state ) && ! hasLoadedSitePurchasesFromServer( state ),
			isSiteAutomatedTransfer: isSiteAutomatedTransfer( state, ownProps.selectedSite.ID ),
			isJetpackSite: isJetpackSite( state, ownProps.selectedSite.ID ),
		};
	},
	{
		recordPaymentSettingsClick,
	}
)( withLocalizedMoment( localize( MappedDomainType ) ) );
