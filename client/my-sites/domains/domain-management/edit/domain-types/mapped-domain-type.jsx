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
import { isExpiringSoon } from 'calypso/lib/domains/utils';
import { recordPaymentSettingsClick } from '../payment-settings-analytics';
import { WPCOM_DEFAULT_NAMESERVERS } from 'calypso/state/domains/nameservers/constants';
import AutoRenewToggle from 'calypso/me/purchases/manage-purchase/auto-renew-toggle';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { isSubdomain, resolveDomainStatus } from 'calypso/lib/domains';
import {
	MAP_DOMAIN_CHANGE_NAME_SERVERS,
	MAP_EXISTING_DOMAIN,
	MAP_EXISTING_DOMAIN_UPDATE_A_RECORDS,
	MAP_SUBDOMAIN,
} from 'calypso/lib/url/support';
import RenewButton from 'calypso/my-sites/domains/domain-management/edit/card/renew-button';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import {
	getByPurchaseId,
	isFetchingSitePurchases,
	hasLoadedSitePurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import ExpiringCreditCard from '../card/notices/expiring-credit-card';
import ExpiringSoon from '../card/notices/expiring-soon';
import DomainManagementNavigationEnhanced from '../navigation/enhanced';
import { DomainExpiryOrRenewal, WrapDomainStatusButtons } from './helpers';
import { hasPendingGSuiteUsers } from 'calypso/lib/gsuite';
import PendingGSuiteTosNotice from 'calypso/my-sites/domains/components/domain-warnings/pending-gsuite-tos-notice';
import FoldableFAQ from 'calypso/components/foldable-faq';
import Notice from 'calypso/components/notice';
class MappedDomainType extends React.Component {
	renderSettingUpNameserversAndARecords() {
		const { domain, translate } = this.props;
		if ( this.props.isJetpackSite && ! this.props.isSiteAutomatedTransfer ) {
			return null;
		}

		if ( domain.pointsToWpcom ) {
			return null;
		}

		let setupInstructionsMessage;
		let primaryMessage;
		let secondaryMessage;

		if ( isSubdomain( domain.name ) ) {
			setupInstructionsMessage = translate(
				'Follow these instructions to set up your subdomain mapping:'
			);
			primaryMessage = translate(
				'Your subdomain mapping has not been set up. You need to create the correct CNAME or NS records at your current DNS provider. {{learnMoreLink}}Learn how to do that in our support guide for mapping subdomains{{/learnMoreLink}}.',
				{
					components: {
						link: this.renderLinkTo( MAP_SUBDOMAIN ),
					},
					args: { domainName: domain.name },
					comment: 'Notice for mapped subdomain that has DNS records need to set up',
				}
			);
			secondaryMessage = translate(
				"Please note that it can take up to 72 hours for your changes to become available. If you're still not seeing your site loading at %(domainName)s, please wait a few more hours, clear your browser cache, and try again.",
				{
					args: { domainName: domain.name },
				}
			);
		} else {
			setupInstructionsMessage = translate(
				'You need to follow these instructions to finish connecting the %(domainName)s domain to your WordPress.com site:',
				{
					args: { domainName: domain.name },
				}
			);
			primaryMessage = translate(
				'Please log into your account at your domain registrar and {{strong}}update the name servers{{/strong}} of your domain to use the following values, as detailed in {{link}}these instructions{{/link}}:',
				{
					comment: 'Notice for mapped domain notice with NS records pointing to somewhere else',
					components: {
						strong: <strong />,
						link: this.renderLinkTo( MAP_DOMAIN_CHANGE_NAME_SERVERS ),
					},
				}
			);
			secondaryMessage = translate(
				"Please note that it can take up to 72 hours for your changes to become available. If you're still not seeing your site loading at %(domainName)s, please wait a few more hours, clear your browser cache, and try again. {{learnMoreLink}}Learn all about mapping an existing domain in our support docs{{/learnMoreLink}}.",
				{
					components: { learnMoreLink: this.renderLinkTo( MAP_EXISTING_DOMAIN ) },
					args: { domainName: domain.name },
				}
			);
		}

		return (
			<React.Fragment>
				<div className="mapped-domain-type__main-content">
					<p>{ setupInstructionsMessage }</p>
					{ this.renderRecommendedSetupMessage( primaryMessage ) }
					{ domain.aRecordsRequiredForMapping && this.renderARecordsMappingMessage() }
				</div>
				<div className="mapped-domain-type__small-message">{ secondaryMessage }</div>
			</React.Fragment>
		);
	}

	renderLinkTo( url ) {
		return <a href={ url } target="_blank" rel="noopener noreferrer" />;
	}

	renderRecommendedSetupMessage( primaryMessage ) {
		const { domain, translate } = this.props;

		return (
			<FoldableFAQ
				id="recommended-mapping-setup"
				question={ translate( 'Recommended setup' ) }
				expanded
			>
				<p>{ primaryMessage }</p>
				{ ! isSubdomain( domain.name ) && (
					<ul className="mapped-domain-type__name-server-list">
						{ WPCOM_DEFAULT_NAMESERVERS.map( ( nameServer ) => {
							return <li key={ nameServer }>{ nameServer }</li>;
						} ) }
					</ul>
				) }
			</FoldableFAQ>
		);
	}

	renderARecordsMappingMessage() {
		const { domain, translate } = this.props;

		const advancedSetupUsingARecordsTitle = translate( 'Advanced setup using root A records' );
		const aRecordMappingWarning = translate(
			'If you map a domain using A records rather than WordPress.com name servers, you will need to manage your domain’s DNS records yourself for any other services you are using with your domain, including email forwarding or email hosting (i.e. with Google Workspace or Titan)'
		);
		const aRecordsSetupMessage = translate(
			'Please set the following IP addresses as root A records using {{link}}these instructions{{/link}}:',
			{
				components: { link: this.renderLinkTo( MAP_EXISTING_DOMAIN_UPDATE_A_RECORDS ) },
			}
		);
		return (
			<FoldableFAQ id="advanced-mapping-setup" question={ advancedSetupUsingARecordsTitle }>
				<Notice status="is-warning" showDismiss={ false }>
					{ aRecordMappingWarning }
				</Notice>
				<p>{ aRecordsSetupMessage }</p>
				<ul className="mapped-domain-type__name-server-list">
					{ domain.aRecordsRequiredForMapping.map( ( aRecord ) => {
						return <li key={ aRecord }>{ aRecord }</li>;
					} ) }
				</ul>
			</FoldableFAQ>
		);
	}

	renderPendingGSuiteTosNotice() {
		const { domain, selectedSite } = this.props;

		if (
			! hasPendingGSuiteUsers( domain ) ||
			( ( ! this.props.isJetpackSite || this.props.isSiteAutomatedTransfer ) &&
				! domain.pointsToWpcom ) ||
			isExpiringSoon( domain, 30 )
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

	renderDefaultRenewButton() {
		const { domain, purchase, isLoadingPurchase, translate } = this.props;

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
				{ ( isLoadingPurchase || purchase ) && (
					<RenewButton
						compact={ true }
						purchase={ purchase }
						selectedSite={ this.props.selectedSite }
						subscriptionId={ parseInt( subscriptionId, 10 ) }
						customLabel={ customLabel }
						tracksProps={ tracksProps }
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
		const { domain, selectedSite, purchase, mappingPurchase, isLoadingPurchase } = this.props;
		const { name: domain_name } = domain;

		const { statusText, statusClass, icon } = resolveDomainStatus( domain, purchase, {
			isJetpackSite: this.props.isJetpackSite,
			isSiteAutomatedTransfer: this.props.isSiteAutomatedTransfer,
		} );

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
					{ this.renderSettingUpNameserversAndARecords() }
					{ this.renderPendingGSuiteTosNotice() }
					<ExpiringSoon
						selectedSite={ selectedSite }
						purchase={ purchase }
						isLoadingPurchase={ isLoadingPurchase }
						domain={ domain }
					/>
				</DomainStatus>
				<Card compact={ true } className="domain-types__expiration-row">
					<DomainExpiryOrRenewal { ...this.props } />
					{ this.renderDefaultRenewButton() }
					{ domain.currentUserCanManage && this.renderAutoRenew() }
				</Card>
				<DomainManagementNavigationEnhanced
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
		const currentUserId = getCurrentUserId( state );

		const purchaseSubscriptionId = bundledPlanSubscriptionId
			? bundledPlanSubscriptionId
			: subscriptionId;

		const purchase = purchaseSubscriptionId
			? getByPurchaseId( state, parseInt( purchaseSubscriptionId, 10 ) )
			: null;

		const mappingPurchase = subscriptionId
			? getByPurchaseId( state, parseInt( subscriptionId, 10 ) )
			: null;

		return {
			purchase: purchase && currentUserId === purchase.userId ? purchase : null,
			mappingPurchase:
				mappingPurchase && currentUserId === mappingPurchase.userId ? mappingPurchase : null,
			isLoadingPurchase:
				isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state ),
			isSiteAutomatedTransfer: isSiteAutomatedTransfer( state, ownProps.selectedSite.ID ),
			isJetpackSite: isJetpackSite( state, ownProps.selectedSite.ID ),
		};
	},
	{
		recordPaymentSettingsClick,
	}
)( withLocalizedMoment( localize( MappedDomainType ) ) );
