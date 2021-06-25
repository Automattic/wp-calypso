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
import AutoRenewToggle from 'calypso/me/purchases/manage-purchase/auto-renew-toggle';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { isSubdomain, resolveDomainStatus } from 'calypso/lib/domains';
import { MAP_EXISTING_DOMAIN } from 'calypso/lib/url/support';
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
import DomainMappingInstructions from 'calypso/my-sites/domains/components/mapping-instructions';
import { DomainExpiryOrRenewal, WrapDomainStatusButtons } from './helpers';
import { hasPendingGSuiteUsers } from 'calypso/lib/gsuite';
import PendingGSuiteTosNotice from 'calypso/my-sites/domains/components/domain-warnings/pending-gsuite-tos-notice';

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
		let secondaryMessage;

		if ( isSubdomain( domain.name ) ) {
			setupInstructionsMessage = translate(
				'You need to follow these instructions to finish connecting the %(domainName)s subdomain to your WordPress.com site:',
				{
					args: { domainName: domain.name },
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
					<DomainMappingInstructions
						aRecordsRequiredForMapping={ domain.aRecordsRequiredForMapping }
						areDomainDetailsLoaded={ true }
						domainName={ domain.name }
						isAtomic={ this.props.isSiteAutomatedTransfer }
						subdomainPart={ domain.subdomainPart }
						wpcomDomainName={ this.props.wpcomDomainName }
					/>
				</div>
				<div className="mapped-domain-type__small-message">{ secondaryMessage }</div>
			</React.Fragment>
		);
	}

	renderLinkTo( url ) {
		return <a href={ url } target="_blank" rel="noopener noreferrer" />;
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
