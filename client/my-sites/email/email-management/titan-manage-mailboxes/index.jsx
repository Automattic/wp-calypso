/**
 * External dependencies
 */
import { CompactCard } from '@automattic/components';
import { connect } from 'react-redux';
import { isDesktop as isDesktopViewport } from '@automattic/viewport';
import page from 'page';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import EmailHeader from 'calypso/my-sites/email/email-header';
import {
	emailManagement,
	emailManagementManageTitanMailboxes,
	emailManagementTitanControlPanelRedirect,
} from 'calypso/my-sites/email/paths';
import EmailPlanHeader from 'calypso/my-sites/email/email-management/home/email-plan-header';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import {
	getEmailPurchaseByDomain,
	hasEmailSubscription,
} from 'calypso/my-sites/email/email-management/home/utils';
import { getDomainsBySite } from 'calypso/state/sites/domains/selectors';
import { getSelectedDomain } from 'calypso/lib/domains';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import {
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import HeaderCake from 'calypso/components/header-cake';
import Notice from 'calypso/components/notice';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import {
	TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_CATCH_ALL_EMAIL,
	TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_DESKTOP_APP,
	TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_INTERNAL_FORWARDING,
	TITAN_CONTROL_PANEL_CONTEXT_GET_MOBILE_APP,
	TITAN_CONTROL_PANEL_CONTEXT_IMPORT_EMAIL_DATA,
} from 'calypso/lib/titan/constants';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItemEnhanced from 'calypso/components/vertical-nav/item/enhanced';
import Main from 'calypso/components/main';

/**
 * Style dependencies
 */
import './style.scss';

class TitanManageMailboxes extends Component {
	static propTypes = {
		// Props passed to this component
		selectedDomainName: PropTypes.string.isRequired,

		// Props injected via connect()
		currentRoute: PropTypes.string.isRequired,
		domain: PropTypes.object,
		hasSubscription: PropTypes.bool.isRequired,
		isLoadingPurchase: PropTypes.bool.isRequired,
		purchase: PropTypes.object,
		selectedSite: PropTypes.object.isRequired,

		// Props injected via localize()
		translate: PropTypes.func.isRequired,
	};

	handleBack = () => {
		const { currentRoute, selectedDomainName, selectedSite } = this.props;

		page( emailManagement( selectedSite.slug, selectedDomainName, currentRoute ) );
	};

	getPath = ( context ) => {
		const { currentRoute, domain, selectedSite } = this.props;

		if ( ! domain ) {
			return '';
		}

		return emailManagementTitanControlPanelRedirect( selectedSite.slug, domain.name, currentRoute, {
			context,
		} );
	};

	getTitanItems = () => {
		const { isDesktop, translate } = this.props;
		return [
			{
				className: 'titan-manage-mailboxes__manage-titan-link',
				disabled: ! isDesktop,
				external: true,
				materialIcon: 'dvr',
				text: translate( 'Configure desktop app' ),
				path: this.getPath( TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_DESKTOP_APP ),
				description: translate( 'View settings required to configure third-party email apps' ),
			},
			{
				className: 'titan-manage-mailboxes__manage-titan-link',
				external: true,
				materialIcon: 'smartphone',
				text: translate( 'Get mobile app' ),
				path: this.getPath( TITAN_CONTROL_PANEL_CONTEXT_GET_MOBILE_APP ),
				description: translate(
					'Download our Android and iOS apps to access your emails on the go'
				),
			},
			{
				className: 'titan-manage-mailboxes__manage-titan-link',
				disabled: ! isDesktop,
				external: true,
				materialIcon: 'move_to_inbox',
				text: translate( 'Import email data' ),
				path: this.getPath( TITAN_CONTROL_PANEL_CONTEXT_IMPORT_EMAIL_DATA ),
				description: translate( 'Migrate existing emails from a remote server via IMAP' ),
			},
			{
				className: 'titan-manage-mailboxes__manage-titan-link',
				disabled: ! isDesktop,
				external: true,
				materialIcon: 'mediation',
				text: translate( 'Configure catch-all email' ),
				path: this.getPath( TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_CATCH_ALL_EMAIL ),
				description: translate(
					'Route all undelivered emails to your domain to a specific mailbox'
				),
			},
			{
				className: 'titan-manage-mailboxes__manage-titan-link',
				disabled: ! isDesktop,
				external: true,
				materialIcon: 'forward_to_inbox',
				text: translate( 'Set up internal forwarding' ),
				path: this.getPath( TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_INTERNAL_FORWARDING ),
				description: translate(
					'Create email aliases that forward messages to one or several mailboxes'
				),
			},
		];
	};

	render() {
		const {
			currentRoute,
			domain,
			hasSubscription,
			isDesktop,
			isLoadingPurchase,
			purchase,
			selectedSite,
			translate,
		} = this.props;

		const manageTitanItems = this.getTitanItems();

		return (
			<>
				<PageViewTracker
					path={ emailManagementManageTitanMailboxes( ':site', ':domain' ) }
					title="Email Management > Titan > Manage All Mailboxes"
				/>

				{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

				{ selectedSite && hasSubscription && <QuerySitePurchases siteId={ selectedSite.ID } /> }

				<Main wideLayout={ true }>
					<DocumentHead title={ translate( 'Manage All Mailboxes' ) } />

					<EmailHeader currentRoute={ currentRoute } selectedSite={ selectedSite } />

					<HeaderCake onClick={ this.handleBack }>
						{ translate( 'Manage all mailboxes' ) }
					</HeaderCake>

					<EmailPlanHeader
						domain={ domain }
						hasEmailSubscription={ hasSubscription }
						isLoadingEmails={ false }
						isLoadingPurchase={ isLoadingPurchase }
						purchase={ purchase }
						selectedSite={ selectedSite }
					/>

					{ isDesktop ? (
						<CompactCard>
							<Notice
								className="titan-manage-mailboxes__mobile-warning"
								status="is-error"
								showDismiss={ false }
							>
								{ translate(
									'Please switch to a desktop device to access all email management features.'
								) }
							</Notice>
						</CompactCard>
					) : null }

					<VerticalNav>
						{ manageTitanItems.map( ( navProps ) => (
							<VerticalNavItemEnhanced { ...navProps } />
						) ) }
					</VerticalNav>
				</Main>
			</>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const selectedSite = getSelectedSite( state );

	const domain = getSelectedDomain( {
		domains: getDomainsBySite( state, selectedSite ),
		isSiteRedirect: false,
		selectedDomainName: ownProps.selectedDomainName,
	} );

	return {
		currentRoute: getCurrentRoute( state ),
		domain,
		hasSubscription: hasEmailSubscription( domain ),
		isDesktop: isDesktopViewport(),
		isLoadingPurchase:
			isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state ),
		purchase: getEmailPurchaseByDomain( state, domain ),
		selectedSite,
	};
} )( localize( TitanManageMailboxes ) );
