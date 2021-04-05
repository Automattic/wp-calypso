/**
 * External dependencies
 */
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
import {
	areAllMailboxesValid,
	buildNewTitanMailbox,
	transformMailboxForCart,
} from 'calypso/lib/titan/new-mailbox';
import { Button, Card } from '@automattic/components';
import DomainManagementHeader from 'calypso/my-sites/domains/domain-management/components/header';
import SectionHeader from 'calypso/components/section-header';
import {
	emailManagement,
	emailManagementManageTitanAccount,
	emailManagementTitanControlPanelRedirect,
} from 'calypso/my-sites/email/paths';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import {
	getMaxTitanMailboxCount,
	getTitanProductName,
	hasTitanMailWithUs,
} from 'calypso/lib/titan';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import {
	getDomainsBySiteId,
	hasLoadedSiteDomains,
	isRequestingSiteDomains,
} from 'calypso/state/sites/domains/selectors';
import { getDomainsWithForwards } from 'calypso/state/selectors/get-email-forwards';
import { getProductBySlug, getProductsList } from 'calypso/state/products-list/selectors';
import { getSelectedDomain } from 'calypso/lib/domains';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import Main from 'calypso/components/main';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import {
	TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL,
	TITAN_MAIL_MONTHLY_SLUG,
} from 'calypso/lib/titan/constants';
import TitanExistingForwardsNotice from 'calypso/my-sites/email/titan-mail-add-mailboxes/titan-existing-forwards-notice';
import TitanMailboxPricingNotice from 'calypso/my-sites/email/titan-mail-add-mailboxes/titan-mailbox-pricing-notice';
import { titanMailMonthly } from 'calypso/lib/cart-values/cart-items';
import TitanNewMailboxList from 'calypso/my-sites/email/titan-mail-add-mailboxes/titan-new-mailbox-list';
import TitanUnusedMailboxesNotice from 'calypso/my-sites/email/titan-mail-add-mailboxes/titan-unused-mailbox-notice';

import { withLocalizedMoment } from 'calypso/components/localized-moment';
import wp from 'calypso/lib/wp';

/**
 * Style dependencies
 */
import './style.scss';

class TitanMailAddMailboxes extends React.Component {
	state = {
		mailboxes: [ buildNewTitanMailbox( this.props.selectedDomainName, false ) ],
		isAddingToCart: false,
	};

	isMounted = false;

	componentDidMount() {
		this.isMounted = true;
	}

	componentWillUnmount() {
		this.isMounted = false;
	}

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

	getCartItem = () => {
		const { maxTitanMailboxCount, selectedDomainName } = this.props;
		const mailboxes = this.state.mailboxes;
		const quantity = mailboxes.length + maxTitanMailboxCount;
		const new_quantity = mailboxes.length;
		const email_users = mailboxes.map( transformMailboxForCart );

		return titanMailMonthly( {
			domain: selectedDomainName,
			quantity,
			extra: {
				email_users,
				new_quantity,
			},
		} );
	};

	checkEmailAvailability = async ( emailAddress ) => {
		const result = await wp.undocumented().getTitanEmailAddressAvailability( emailAddress );
		return !! result;
	};

	handleContinue = () => {
		const { selectedSite } = this.props;
		const { mailboxes } = this.state;
		const canContinue = areAllMailboxesValid( mailboxes, [ 'alternativeEmail' ] );

		this.recordClickEvent( 'calypso_email_management_titan_add_mailboxes_continue_button_click', {
			can_continue: canContinue,
			mailbox_count: mailboxes.length,
		} );

		this.checkEmailAvailability( 'fi@sleazy.com' );

		if ( canContinue ) {
			this.setState( { isAddingToCart: true } );
			this.props.shoppingCartManager
				.addProductsToCart( [
					fillInSingleCartItemAttributes( this.getCartItem(), this.props.productsList ),
				] )
				.then( () => {
					if ( this.isMounted ) {
						this.setState( { isAddingToCart: false } );
					}
					const { errors } = this.props?.cart?.messages;
					if ( errors && errors.length ) {
						// Stay on the page to show the relevant error
						return;
					}
					return this.isMounted && page( '/checkout/' + selectedSite.slug );
				} );
		}
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

	onButtonClick = () => {
		this.setState( { quantity: this.state.quantity + 1 } );
	};

	onMailboxesChange = ( updatedMailboxes ) => {
		this.setState( { mailboxes: updatedMailboxes, quantity: updatedMailboxes.length } );
	};

	renderForm() {
		const { isLoadingDomains, selectedDomainName, titanMonthlyProduct, translate } = this.props;

		if ( isLoadingDomains || ! titanMonthlyProduct ) {
			return <AddEmailAddressesCardPlaceholder />;
		}

		return (
			<>
				<SectionHeader label={ translate( 'Add New Mailboxes' ) } />

				<Card>
					<TitanNewMailboxList
						domain={ selectedDomainName }
						mailboxes={ this.state.mailboxes }
						onMailboxesChange={ this.onMailboxesChange }
					>
						<Button
							className="titan-mail-add-mailboxes__action-cancel"
							onClick={ this.handleCancel }
						>
							{ translate( 'Cancel' ) }
						</Button>
						<Button
							className="titan-mail-add-mailboxes__action-continue"
							primary
							busy={ this.state.isAddingToCart }
							onClick={ this.handleContinue }
						>
							{ translate( 'Continue' ) }
						</Button>
					</TitanNewMailboxList>
				</Card>
			</>
		);
	}

	render() {
		const {
			domainsWithForwards,
			selectedDomain,
			selectedDomainName,
			selectedSite,
			isSelectedDomainNameValid,
			isLoadingDomains,
			maxTitanMailboxCount,
			titanMonthlyProduct,
		} = this.props;

		if ( ! isLoadingDomains && ! isSelectedDomainNameValid ) {
			this.goToEmail();
			return null;
		}

		const finishSetupLinkIsExternal = ! isEnabled( 'titan/iframe-control-panel' );

		return (
			<>
				<QueryProductsList />

				{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

				<Main>
					<DomainManagementHeader
						onClick={ this.goToEmail }
						selectedDomainName={ selectedDomainName }
					>
						{ getTitanProductName() + ': ' + selectedDomainName }
					</DomainManagementHeader>

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
			productsList: getProductsList( state ),
			maxTitanMailboxCount: hasTitanMailWithUs( selectedDomain )
				? getMaxTitanMailboxCount( selectedDomain )
				: 0,
			titanMonthlyProduct: getProductBySlug( state, TITAN_MAIL_MONTHLY_SLUG ),
			isSelectedDomainNameValid: !! selectedDomain,
		};
	},
	{ recordTracksEvent: recordTracksEventAction }
)( withShoppingCart( withLocalizedMoment( localize( TitanMailAddMailboxes ) ) ) );
