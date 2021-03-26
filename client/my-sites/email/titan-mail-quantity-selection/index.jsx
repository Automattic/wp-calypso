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
import { Button, Card } from '@automattic/components';
import DomainManagementHeader from 'calypso/my-sites/domains/domain-management/components/header';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import {
	emailManagement,
	emailManagementManageTitanAccount,
	emailManagementTitanControlPanelRedirect,
} from 'calypso/my-sites/email/paths';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import Gridicon from 'calypso/components/gridicon';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import { titanMailMonthly } from 'calypso/lib/cart-values/cart-items';
import {
	getDomainsBySiteId,
	hasLoadedSiteDomains,
	isRequestingSiteDomains,
} from 'calypso/state/sites/domains/selectors';
import { getDomainsWithForwards } from 'calypso/state/selectors/get-email-forwards';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import AddEmailAddressesCardPlaceholder from 'calypso/my-sites/email/gsuite-add-users/add-users-placeholder';
import { getSelectedDomain } from 'calypso/lib/domains';
import {
	getMaxTitanMailboxCount,
	getTitanProductName,
	hasTitanMailWithUs,
} from 'calypso/lib/titan';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import { getProductBySlug, getProductsList } from 'calypso/state/products-list/selectors';
import {
	TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL,
	TITAN_MAIL_MONTHLY_SLUG,
} from 'calypso/lib/titan/constants';
import TitanExistingForwardsNotice from 'calypso/my-sites/email/titan-mail-add-mailboxes/titan-existing-forwards-notice';
import TitanMailboxPricingNotice from 'calypso/my-sites/email/titan-mail-add-mailboxes/titan-mailbox-pricing-notice';
import TitanUnusedMailboxesNotice from 'calypso/my-sites/email/titan-mail-add-mailboxes/titan-unused-mailbox-notice';
import { withLocalizedMoment } from 'calypso/components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

class TitanMailQuantitySelection extends React.Component {
	state = {
		quantity: 1,
	};

	isMounted = false;

	componentDidMount() {
		this.isMounted = true;
	}

	componentWillUnmount() {
		this.isMounted = false;
	}

	recordClickEvent = ( eventName ) => {
		const { recordTracksEvent, selectedDomainName } = this.props;
		recordTracksEvent( eventName, {
			domain_name: selectedDomainName,
			quantity: this.state.quantity,
		} );
	};

	goToEmail = () => {
		page(
			emailManagement(
				this.props.selectedSite.slug,
				this.props.isSelectedDomainNameValid ? this.props.selectedDomainName : null,
				this.props.currentRoute
			)
		);
	};

	handleCancel = () => {
		this.recordClickEvent(
			'calypso_email_management_titan_quantity_selection_cancel_button_click'
		);
		this.goToEmail();
	};

	getCartItem = () => {
		const { maxTitanMailboxCount, selectedDomainName } = this.props;
		const quantity = this.state.quantity + maxTitanMailboxCount;
		const new_quantity = this.state.quantity;
		return titanMailMonthly( { domain: selectedDomainName, quantity, extra: { new_quantity } } );
	};

	handleContinue = () => {
		const { selectedSite } = this.props;

		this.recordClickEvent(
			'calypso_email_management_titan_quantity_selection_continue_button_click'
		);

		this.props.shoppingCartManager
			.addProductsToCart( [
				fillInSingleCartItemAttributes( this.getCartItem(), this.props.productsList ),
			] )
			.then( () => {
				const { errors } = this.props?.cart?.messages;
				if ( errors && errors.length ) {
					// Stay on the page to show the relevant error
					return;
				}
				return this.isMounted && page( '/checkout/' + selectedSite.slug );
			} );
	};

	handleCreateMailbox = () => {
		const {
			currentRoute,
			isSelectedDomainNameValid,
			selectedDomainName,
			selectedSite,
		} = this.props;

		this.recordClickEvent(
			'calypso_email_management_titan_quantity_selection_create_mailbox_click'
		);

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

	onQuantityChange = ( event ) => {
		const { target } = event;

		const parsedQuantity = parseInt( target.value, 10 );
		const quantity = isNaN( parsedQuantity ) ? 1 : Math.max( 1, parsedQuantity );

		if ( quantity.toString() !== target.value ) {
			target.value = quantity;
		}

		this.setState( { quantity } );
	};

	renderForm() {
		const { isLoadingDomains, titanMonthlyProduct, translate } = this.props;

		if ( isLoadingDomains || ! titanMonthlyProduct ) {
			return <AddEmailAddressesCardPlaceholder />;
		}

		return (
			<>
				<SectionHeader label={ translate( 'Add New Mailboxes' ) } />

				<Card>
					<div className="titan-mail-quantity-selection__form">
						<FormLabel htmlFor="quantity">{ translate( 'Number of mailboxes' ) }</FormLabel>

						<FormTextInput
							name="quantity"
							id="quantity"
							type="number"
							min="1"
							max="50"
							step="1"
							placeholder={ translate( 'Number of mailboxes' ) }
							value={ this.state.quantity }
							onChange={ this.onQuantityChange }
						/>

						<Button onClick={ this.onButtonClick }>
							<Gridicon icon="plus" />

							<span>{ translate( 'Add another mailbox' ) }</span>
						</Button>
					</div>

					<hr className="titan-mail-quantity-selection__divider" />

					<div className="titan-mail-quantity-selection__buttons">
						<Button onClick={ this.handleCancel }>{ translate( 'Cancel' ) }</Button>

						<Button primary onClick={ this.handleContinue }>
							{ translate( 'Continue' ) }
						</Button>
					</div>
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
					<TitanUnusedMailboxesNotice
						domain={ selectedDomain }
						linkIsExternal={ finishSetupLinkIsExternal }
						maxTitanMailboxCount={ maxTitanMailboxCount }
						onFinishSetupClick={ this.handleCreateMailbox }
					/>
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
)( withShoppingCart( withLocalizedMoment( localize( TitanMailQuantitySelection ) ) ) );
