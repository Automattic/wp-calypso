/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import formatCurrency from '@automattic/format-currency';
import Notice from 'components/notice';

/**
 * Internal dependencies
 */
import './style.scss';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import HeaderCake from 'components/header-cake';
import SectionHeader from 'components/section-header';
import { Button, CompactCard, Dialog } from '@automattic/components';
import QueryMembershipProducts from 'components/data/query-memberships';
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import Gridicon from 'components/gridicon';
import {
	requestAddProduct,
	requestUpdateProduct,
	requestDeleteProduct,
} from 'state/memberships/product-list/actions';
import RecurringPaymentsPlanAddEditModal from './add-edit-plan-modal';

/**
 * @typedef {[string, number] CurrencyMinimum
 *
 *
 * Stripe Currencies also supported by WordPress.com with minimum transaction amounts.
 *
 * https://stripe.com/docs/currencies#minimum-and-maximum-charge-amounts
 *
 * @type { [currency: string]: number }
 */
const MINIMUM_CURRENCY_AMOUNT = {
	USD: 0.5,
	AUD: 0.5,
	BRL: 0.5,
	CAD: 0.5,
	CHF: 0.5,
	DKK: 2.5,
	EUR: 0.5,
	GBP: 0.3,
	HKD: 4.0,
	INR: 0.5,
	JPY: 50,
	MXN: 10,
	NOK: 3.0,
	NZD: 0.5,
	PLN: 2.0,
	SEK: 3.0,
	SGD: 0.5,
};

/**
 * @type Array<{ code: string }>
 */
const currencyList = Object.keys( MINIMUM_CURRENCY_AMOUNT ).map( ( code ) => ( { code } ) );

class MembershipsProductsSection extends Component {
	constructor() {
		super();
		this.onCloseDialog = this.onCloseDialog.bind( this );
	}
	state = {
		showDialog: false,
		product: {},
	};
	renderEllipsisMenu( productId ) {
		return (
			<EllipsisMenu position="bottom left">
				<PopoverMenuItem onClick={ () => this.openProductDialog( productId ) }>
					<Gridicon size={ 18 } icon={ 'pencil' } />
					{ this.props.translate( 'Edit' ) }
				</PopoverMenuItem>
				<PopoverMenuItem onClick={ () => this.setState( { deletedProductId: productId } ) }>
					<Gridicon size={ 18 } icon={ 'trash' } />
					{ this.props.translate( 'Delete' ) }
				</PopoverMenuItem>
			</EllipsisMenu>
		);
	}

	onCloseDialog = ( reason ) => {
		if ( reason === 'submit' && ! this.state.editedProductId ) {
			this.props.requestAddProduct(
				this.props.siteId,
				{
					currency: this.state.editedPrice.currency,
					price: this.state.editedPrice.value,
					title: this.state.editedProductName,
					interval: this.state.editedSchedule,
					buyer_can_change_amount: this.state.editedPayWhatYouWant,
					multiple_per_user: this.state.editedMultiplePerUser,
					welcome_email_content: this.state.editedCustomConfirmationMessage,
					subscribe_as_site_subscriber: this.state.editedPostsEmail,
				},
				this.props.translate( 'Added "%s" product.', { args: this.state.editedProductName } )
			);
		} else if ( reason === 'submit' && this.state.editedProductId ) {
			this.props.requestUpdateProduct(
				this.props.siteId,
				{
					ID: this.state.editedProductId,
					currency: this.state.editedPrice.currency,
					price: this.state.editedPrice.value,
					title: this.state.editedProductName,
					interval: this.state.editedSchedule,
					buyer_can_change_amount: this.state.editedPayWhatYouWant,
					multiple_per_user: this.state.editedMultiplePerUser,
					welcome_email_content: this.state.editedCustomConfirmationMessage,
					subscribe_as_site_subscriber: this.state.editedPostsEmail,
				},
				this.props.translate( 'Updated "%s" product.', { args: this.state.editedProductName } )
			);
		}
		this.setState( { showDialog: false, editedProductId: null } );
	};

	openProductDialog = ( editedProductId ) => {
		if ( editedProductId ) {
			const product = this.props.products.filter( ( prod ) => prod.ID === editedProductId ).pop();
			this.setState( {
				showDialog: 'editPlan',
				product,
			} );
		} else {
			this.setState( { showDialog: 'addNewPlan' } );
		}
	};

	onCloseDeleteProduct = ( reason ) => {
		if ( reason === 'delete' ) {
			const product = this.props.products
				.filter( ( p ) => p.ID === this.state.deletedProductId )
				.pop();
			this.props.requestDeleteProduct(
				this.props.siteId,
				product,
				this.props.translate( '"%s" was deleted.', { args: product.title } )
			);
		}
		this.setState( { deletedProductId: null } );
	};

	renderAddNewPlanDialog() {
		return (
			<RecurringPaymentsPlanAddEditModal
				isVisible={ this.state.showDialog === 'addNewPlan' }
				currencyList={ currencyList }
				minimumCurrencyTransactionAmount={ minimumCurrencyTransactionAmount }
				onClose={ this.onCloseDialog }
				productId={ null }
			/>
		);
	}

	renderEditPlanDialog() {
		return (
			<RecurringPaymentsPlanAddEditModal
				isVisible={ this.state.showDialog === 'editPlan' }
				currencyList={ currencyList }
				minimumCurrencyTransactionAmount={ minimumCurrencyTransactionAmount }
				onClose={ this.onCloseDialog }
				product={ this.state.product }
			/>
		);
	}

	render() {
		return (
			<div>
				<QueryMembershipProducts siteId={ this.props.siteId } />
				<HeaderCake backHref={ '/earn/payments/' + this.props.siteSlug }>
					{ this.props.translate( 'Recurring Payments plans' ) }
				</HeaderCake>

				<SectionHeader>
					<Button primary compact onClick={ () => this.openProductDialog( null ) }>
						{ this.props.translate( 'Add new plan' ) }
					</Button>
				</SectionHeader>
				{ this.props.products.map( ( product ) => (
					<CompactCard className="memberships__products-product-card" key={ product.ID }>
						<div className="memberships__products-product-details">
							<div className="memberships__products-product-price">
								{ formatCurrency( product.price, product.currency ) }
							</div>
							<div className="memberships__products-product-title">{ product.title }</div>
						</div>

						{ this.renderEllipsisMenu( product.ID ) }
					</CompactCard>
				) ) }
				{ this.renderAddNewPlanDialog() }
				{ this.renderEditPlanDialog() }
				<Dialog
					isVisible={ !! this.state.deletedProductId }
					buttons={ [
						{
							label: this.props.translate( 'Cancel' ),
							action: 'cancel',
						},
						{
							label: this.props.translate( 'Delete' ),
							isPrimary: true,
							action: 'delete',
						},
					] }
					onClose={ this.onCloseDeleteProduct }
				>
					<h1>{ this.props.translate( 'Confirmation' ) }</h1>
					<p>
						{ this.props.translate( 'Do you want to delete "%s"?', {
							args: get(
								this.props.products.filter( ( p ) => p.ID === this.state.deletedProductId ),
								[ 0, 'title' ],
								''
							),
						} ) }
					</p>
					<Notice
						text={ this.props.translate(
							'Deleting a product does not cancel the subscription for existing subscribers.{{br/}}They will continue to be charged even after you delete it.',
							{ components: { br: <br /> } }
						) }
						showDismiss={ false }
					/>
				</Dialog>
			</div>
		);
	}
}

/**
 * Return the minimum transaction amount for a currency.
 *
 *
 * @param {string} currency - Currency.
 * @returns {number} Minimum transaction amount for given currency.
 */
function minimumCurrencyTransactionAmount( currency ) {
	return MINIMUM_CURRENCY_AMOUNT[ currency ];
}

export default connect(
	( state ) => {
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );
		return {
			site,
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
			products: get( state, [ 'memberships', 'productList', 'items', siteId ], [] ),
		};
	},
	{ requestAddProduct, requestUpdateProduct, requestDeleteProduct }
)( localize( MembershipsProductsSection ) );
