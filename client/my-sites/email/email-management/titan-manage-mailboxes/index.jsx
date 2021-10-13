import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import titleCase from 'to-title-case';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItemEnhanced from 'calypso/components/vertical-nav/item/enhanced';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSelectedDomain } from 'calypso/lib/domains';
import {
	TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_CATCH_ALL_EMAIL,
	TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_DESKTOP_APP,
	TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_INTERNAL_FORWARDING,
	TITAN_CONTROL_PANEL_CONTEXT_GET_MOBILE_APP,
	TITAN_CONTROL_PANEL_CONTEXT_IMPORT_EMAIL_DATA,
} from 'calypso/lib/titan/constants';
import EmailHeader from 'calypso/my-sites/email/email-header';
import EmailPlanHeader from 'calypso/my-sites/email/email-management/home/email-plan-header';
import {
	getEmailPurchaseByDomain,
	hasEmailSubscription,
} from 'calypso/my-sites/email/email-management/home/utils';
import {
	emailManagement,
	emailManagementManageTitanMailboxes,
	emailManagementTitanControlPanelRedirect,
} from 'calypso/my-sites/email/paths';
import {
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySite } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

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

	render() {
		const {
			currentRoute,
			domain,
			hasSubscription,
			isLoadingPurchase,
			purchase,
			selectedSite,
			translate,
		} = this.props;

		return (
			<>
				<PageViewTracker
					path={ emailManagementManageTitanMailboxes( ':site', ':domain' ) }
					title="Email Management > Titan > Manage All Mailboxes"
				/>

				{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

				{ selectedSite && hasSubscription && <QuerySitePurchases siteId={ selectedSite.ID } /> }

				<Main wideLayout={ true }>
					<DocumentHead title={ titleCase( translate( 'Manage all mailboxes' ) ) } />

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

					<VerticalNav>
						<VerticalNavItemEnhanced
							description={ translate(
								'View settings required to configure third-party email apps'
							) }
							external={ true }
							materialIcon="dvr"
							path={ this.getPath( TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_DESKTOP_APP ) }
							text={ translate( 'Configure desktop app' ) }
						/>

						<VerticalNavItemEnhanced
							description={ translate(
								"Download Titan's Android and iOS apps to access your emails on the go"
							) }
							external={ true }
							materialIcon="smartphone"
							path={ this.getPath( TITAN_CONTROL_PANEL_CONTEXT_GET_MOBILE_APP ) }
							text={ translate( 'Get mobile app' ) }
						/>

						<VerticalNavItemEnhanced
							description={ translate( 'Migrate existing emails from a remote server via IMAP' ) }
							external={ true }
							materialIcon="move_to_inbox"
							path={ this.getPath( TITAN_CONTROL_PANEL_CONTEXT_IMPORT_EMAIL_DATA ) }
							text={ translate( 'Import email data' ) }
						/>

						<VerticalNavItemEnhanced
							description={ translate(
								'Route all undelivered emails to your domain to a specific mailbox'
							) }
							external={ true }
							materialIcon="mediation"
							path={ this.getPath( TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_CATCH_ALL_EMAIL ) }
							text={ translate( 'Configure catch-all email' ) }
						/>

						<VerticalNavItemEnhanced
							description={ translate(
								'Create email aliases that forward messages to one or several mailboxes'
							) }
							external={ true }
							materialIcon="forward_to_inbox"
							path={ this.getPath( TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_INTERNAL_FORWARDING ) }
							text={ translate( 'Set up internal forwarding' ) }
						/>
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
		isLoadingPurchase:
			isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state ),
		purchase: getEmailPurchaseByDomain( state, domain ),
		selectedSite,
	};
} )( localize( TitanManageMailboxes ) );
