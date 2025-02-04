import page from '@automattic/calypso-router';
import { CompactCard } from '@automattic/components';
import { isDesktop, subscribeIsDesktop } from '@automattic/viewport';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import titleCase from 'to-title-case';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItemEnhanced from 'calypso/components/vertical-nav/item/enhanced';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSelectedDomain } from 'calypso/lib/domains';
import {
	TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_CATCH_ALL_EMAIL,
	TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_DESKTOP_APP,
	TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_INTERNAL_FORWARDING,
	TITAN_CONTROL_PANEL_CONTEXT_GET_MOBILE_APP,
	TITAN_CONTROL_PANEL_CONTEXT_IMPORT_EMAIL_DATA,
} from 'calypso/lib/titan/constants';
import EmailHeader from 'calypso/my-sites/email/email-header';
import { EmailPlanHeader } from 'calypso/my-sites/email/email-management/home/email-plan-header';
import {
	getEmailPurchaseByDomain,
	hasEmailSubscription,
} from 'calypso/my-sites/email/email-management/home/utils';
import {
	getEmailManagementPath,
	getTitanControlPanelRedirectPath,
} from 'calypso/my-sites/email/paths';
import {
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySite } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

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

	state = { isDesktop: isDesktop() };
	unsubscribe = () => {};

	componentDidMount() {
		this.unsubscribe = subscribeIsDesktop( ( isActive ) => {
			this.setState( { isDesktop: isActive } );
		} );
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	handleBack = () => {
		const { currentRoute, selectedDomainName, selectedSite } = this.props;

		page( getEmailManagementPath( selectedSite.slug, selectedDomainName, currentRoute ) );
	};

	buildNavigationItem = ( { context, description, isDisabled = false, materialIcon, text } ) => ( {
		description,
		disabled: isDisabled,
		materialIcon,
		path: this.getPath( context ),
		onClick: () => {
			recordTracksEvent( 'calypso_email_management_titan_manage_mailboxes_link_click', {
				context,
			} );
		},
		text,
	} );

	getNavigationItems = () => {
		const { translate } = this.props;
		const isDisabled = ! this.state.isDesktop;

		return [
			{
				context: TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_DESKTOP_APP,
				isDisabled,
				description: translate( 'View settings required to configure third-party email apps' ),
				materialIcon: 'dvr',
				text: translate( 'Configure desktop app' ),
			},
			{
				context: TITAN_CONTROL_PANEL_CONTEXT_GET_MOBILE_APP,
				description: translate(
					"Download Titan's Android and iOS apps to access your emails on the go"
				),
				materialIcon: 'smartphone',
				text: translate( 'Get mobile app' ),
			},
			{
				context: TITAN_CONTROL_PANEL_CONTEXT_IMPORT_EMAIL_DATA,
				isDisabled,
				description: translate( 'Migrate existing emails from a remote server via IMAP' ),
				materialIcon: 'move_to_inbox',
				text: translate( 'Import email data' ),
			},
			{
				context: TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_CATCH_ALL_EMAIL,
				isDisabled,
				description: translate(
					'Route all undelivered emails to your domain to a specific mailbox'
				),
				materialIcon: 'mediation',
				text: translate( 'Configure catch-all email' ),
			},
			{
				context: TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_INTERNAL_FORWARDING,
				isDisabled,
				description: translate(
					'Create email aliases that forward messages to one or several mailboxes'
				),
				materialIcon: 'forward_to_inbox',
				text: translate( 'Set up internal forwarding' ),
			},
		].map( this.buildNavigationItem );
	};

	getPath = ( context ) => {
		const { currentRoute, domain, selectedSite } = this.props;

		if ( ! domain ) {
			return '';
		}

		return getTitanControlPanelRedirectPath( selectedSite.slug, domain.name, currentRoute, {
			context,
		} );
	};

	render() {
		const { domain, hasSubscription, isLoadingPurchase, purchase, selectedSite, translate } =
			this.props;

		return (
			<>
				{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

				{ selectedSite && hasSubscription && <QuerySitePurchases siteId={ selectedSite.ID } /> }

				<Main wideLayout>
					<DocumentHead title={ titleCase( translate( 'Manage all mailboxes' ) ) } />

					<EmailHeader />

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

					{ this.state.isDesktop || (
						<CompactCard>
							<Notice
								className="titan-manage-mailboxes__mobile-warning"
								status="is-error"
								showDismiss={ false }
							>
								{ translate(
									'Please switch to a device with a larger screen to access all email management features.'
								) }
							</Notice>
						</CompactCard>
					) }

					{ hasSubscription && (
						<VerticalNav>
							{ this.getNavigationItems().map( ( navigationItem ) => (
								<VerticalNavItemEnhanced
									className="titan-manage-mailboxes__manage-titan-link"
									external
									key={ navigationItem.path }
									{ ...navigationItem }
								/>
							) ) }
						</VerticalNav>
					) }
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
