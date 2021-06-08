/**
 * External dependencies
 */
import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import React from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { isEnabled } from '@automattic/calypso-config';
import { withShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import AddEmailAddressesCardPlaceholder from 'calypso/my-sites/email/gsuite-add-users/add-users-placeholder';
import DocumentHead from 'calypso/components/data/document-head';
import EmailHeader from 'calypso/my-sites/email/email-header';
import {
	emailManagement,
	emailManagementManageTitanAccount,
	emailManagementNewTitanAccount,
	emailManagementTitanControlPanelRedirect,
} from 'calypso/my-sites/email/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import {
	getDomainsBySiteId,
	hasLoadedSiteDomains,
	isRequestingSiteDomains,
} from 'calypso/state/sites/domains/selectors';
import { getDomainsWithForwards } from 'calypso/state/selectors/get-email-forwards';
import {
	getMaxTitanMailboxCount,
	getTitanProductName,
	hasTitanMailWithUs,
} from 'calypso/lib/titan';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { getSelectedDomain } from 'calypso/lib/domains';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import SectionHeader from 'calypso/components/section-header';
import {
	TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL,
	TITAN_MAIL_MONTHLY_SLUG,
} from 'calypso/lib/titan/constants';
import TitanExistingForwardsNotice from 'calypso/my-sites/email/titan-add-mailboxes/titan-existing-forwards-notice';
import TitanMailboxPricingNotice from 'calypso/my-sites/email/titan-add-mailboxes/titan-mailbox-pricing-notice';
import TitanNewMailboxList from 'calypso/my-sites/email/titan-add-mailboxes/titan-new-mailbox-list';
import TitanUnusedMailboxesNotice from 'calypso/my-sites/email/titan-add-mailboxes/titan-unused-mailbox-notice';
import { withLocalizedMoment } from 'calypso/components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

class TitanAddMailboxes extends React.Component {
	recordClickEvent = ( eventName, eventProps ) => {
		const { recordTracksEvent, selectedDomainName } = this.props;
		recordTracksEvent( eventName, {
			...eventProps,
			domain_name: selectedDomainName,
		} );
	};

	goToEmail = () => {
		const {
			currentRoute,
			isSelectedDomainNameValid,
			selectedDomainName,
			selectedSite,
		} = this.props;

		page(
			emailManagement(
				selectedSite.slug,
				isSelectedDomainNameValid ? selectedDomainName : null,
				currentRoute
			)
		);
	};

	handleCancel = () => {
		this.recordClickEvent( 'calypso_email_management_titan_add_mailboxes_cancel_button_click' );
		this.goToEmail();
	};

	trackMailboxSubmission = ( { mailboxCount, mailboxesAreValid } ) => {
		this.recordClickEvent( 'calypso_email_management_titan_add_mailboxes_continue_button_click', {
			can_continue: mailboxesAreValid,
			mailbox_count: mailboxCount,
		} );
	};

	handleUnusedMailboxFinishSetupClick = () => {
		const {
			currentRoute,
			isSelectedDomainNameValid,
			selectedDomainName,
			selectedSite,
		} = this.props;

		this.recordClickEvent( 'calypso_email_management_titan_add_mailboxes_create_mailbox_click' );

		const domainName = isSelectedDomainNameValid ? selectedDomainName : null;

		if ( isEnabled( 'titan/iframe-control-panel' ) ) {
			page(
				emailManagementManageTitanAccount( selectedSite.slug, domainName, currentRoute, {
					context: TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL,
				} )
			);

			return;
		}

		window.open(
			emailManagementTitanControlPanelRedirect( selectedSite.slug, domainName, currentRoute, {
				context: TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL,
			} )
		);
	};

	renderForm() {
		const {
			isLoadingDomains,
			selectedDomain,
			selectedDomainName,
			titanMonthlyProduct,
			translate,
		} = this.props;

		if ( isLoadingDomains || ! titanMonthlyProduct ) {
			return <AddEmailAddressesCardPlaceholder />;
		}

		return (
			<>
				<SectionHeader label={ translate( 'Add New Mailboxes' ) } />

				<Card>
					<TitanNewMailboxList
						cancelButtonClassName="titan-add-mailboxes__action-cancel"
						cancelButtonText={ translate( 'Cancel' ) }
						domainName={ selectedDomainName }
						existingDomainObject={ selectedDomain }
						onCancel={ this.handleCancel }
						onSubmitMailboxList={ this.trackMailboxSubmission }
						shouldCheckAvailability={ true }
						showCancelButton={ true }
						submitButtonClassName="titan-add-mailboxes__action-continue"
						submitButtonText={ translate( 'Continue' ) }
					/>
				</Card>
			</>
		);
	}

	render() {
		const {
			currentRoute,
			domainsWithForwards,
			isLoadingDomains,
			isSelectedDomainNameValid,
			maxTitanMailboxCount,
			selectedDomain,
			selectedDomainName,
			selectedSite,
			titanMonthlyProduct,
			translate,
		} = this.props;

		if ( ! isLoadingDomains && ! isSelectedDomainNameValid ) {
			this.goToEmail();
			return null;
		}

		const analyticsPath = emailManagementNewTitanAccount( ':site', ':domain', currentRoute );
		const finishSetupLinkIsExternal = ! isEnabled( 'titan/iframe-control-panel' );

		return (
			<>
				<PageViewTracker path={ analyticsPath } title="Email Management > Add Titan Mailboxes" />

				<QueryProductsList />

				{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

				<Main wideLayout={ true }>
					<DocumentHead title={ translate( 'Add New Mailboxes' ) } />

					<EmailHeader currentRoute={ currentRoute } selectedSite={ selectedSite } />

					<HeaderCake onClick={ this.goToEmail }>
						{ getTitanProductName() + ': ' + selectedDomainName }
					</HeaderCake>

					<TitanExistingForwardsNotice domainsWithForwards={ domainsWithForwards } />
					{ selectedDomain && (
						<TitanUnusedMailboxesNotice
							domain={ selectedDomain }
							linkIsExternal={ finishSetupLinkIsExternal }
							maxTitanMailboxCount={ maxTitanMailboxCount }
							onFinishSetupClick={ this.handleUnusedMailboxFinishSetupClick }
						/>
					) }
					{ selectedDomain && titanMonthlyProduct && (
						<TitanMailboxPricingNotice
							domain={ selectedDomain }
							titanMonthlyProduct={ titanMonthlyProduct }
						/>
					) }
					{ this.renderForm() }
				</Main>
			</>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const selectedSite = getSelectedSite( state );
		const siteId = selectedSite?.ID ?? null;
		const domains = getDomainsBySiteId( state, siteId );
		const isLoadingDomains =
			! hasLoadedSiteDomains( state, siteId ) || isRequestingSiteDomains( state, siteId );
		const selectedDomain = getSelectedDomain( {
			domains,
			selectedDomainName: ownProps.selectedDomainName,
		} );
		return {
			selectedDomain,
			selectedSite,
			isLoadingDomains,
			currentRoute: getCurrentRoute( state ),
			domainsWithForwards: getDomainsWithForwards( state, domains ),
			maxTitanMailboxCount: hasTitanMailWithUs( selectedDomain )
				? getMaxTitanMailboxCount( selectedDomain )
				: 0,
			titanMonthlyProduct: getProductBySlug( state, TITAN_MAIL_MONTHLY_SLUG ),
			isSelectedDomainNameValid: !! selectedDomain,
		};
	},
	{ recordTracksEvent: recordTracksEventAction }
)( withShoppingCart( withLocalizedMoment( localize( TitanAddMailboxes ) ) ) );
