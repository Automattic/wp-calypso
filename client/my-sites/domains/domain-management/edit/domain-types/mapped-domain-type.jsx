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

class MappedDomainType extends React.Component {
	renderSettingUpNameserversAndARecords() {
		const { domain, translate } = this.props;
		if ( this.props.isJetpackSite && ! this.props.isSiteAutomatedTransfer ) {
			return null;
		}

		if ( domain.pointsToWpcom ) {
			return null;
		}

		const generateLinkTo = ( linksTo ) => (
			<a href={ linksTo } target="_blank" rel="noopener noreferrer" />
		);
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
						strong: <strong />,
						link: generateLinkTo( MAP_SUBDOMAIN ),
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
				'Follow these instructions to set up your domain mapping:'
			);
			primaryMessage = translate(
				'In order to connect your domain to WordPress.com, please log into your account at your domain registrar and update the name servers of your domain to use the following values, as detailed in {{link}}these instructions{{/link}}:',
				{
					comment: 'Notice for mapped domain notice with NS records pointing to somewhere else',
					components: { link: generateLinkTo( MAP_DOMAIN_CHANGE_NAME_SERVERS ) },
				}
			);
			secondaryMessage = translate(
				"Please note that it can take up to 72 hours for your changes to become available. If you're still not seeing your site loading at %(domainName)s, please wait a few more hours, clear your browser cache, and try again. {{learnMoreLink}}Learn all about mapping an existing domain in our support docs{{/learnMoreLink}}.",
				{
					components: { learnMoreLink: generateLinkTo( MAP_EXISTING_DOMAIN ) },
					args: { domainName: domain.name },
				}
			);
		}

		return (
			<React.Fragment>
				<div>
					<p>{ setupInstructionsMessage }</p>
					{ this.renderRecommendedSetupMessage( primaryMessage ) }
					{ domain.aRecordsRequiredForMapping && this.renderARecordsMappingMessage() }
				</div>
				<div className="mapped-domain-type__small-message">{ secondaryMessage }</div>
			</React.Fragment>
		);
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

		const generateLinkTo = ( href ) => (
			<a href={ href } target="_blank" rel="noopener noreferrer" />
		);
		const advancedSetupUsingARecordsTitle = translate( 'Advanced setup using root A records' );
		const aRecordsSetupMessage = translate(
			'We recommend using WordPress.com’s name servers to map your domain, but if you prefer you can use different name servers and manage the configuration of your domain yourself. To point your domain to WordPress.com, please add the following IP addresses as root A records using {{link}}these instructions{{/link}}:',
			{
				components: { link: generateLinkTo( MAP_EXISTING_DOMAIN_UPDATE_A_RECORDS ) },
			}
		);
		return (
			<FoldableFAQ id="advanced-mapping-setup" question={ advancedSetupUsingARecordsTitle }>
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
