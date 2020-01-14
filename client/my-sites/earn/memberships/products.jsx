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
import { Button, CompactCard, Dialog, Gridicon } from '@automattic/components';
import QueryMembershipProducts from 'components/data/query-memberships';
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import FormInputValidation from 'components/forms/form-input-validation';
import FormTextInput from 'components/forms/form-text-input';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormSelect from 'components/forms/form-select';
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormLabel from 'components/forms/form-label';
import FormFieldset from 'components/forms/form-fieldset';
import FormToggle from 'components/forms/form-toggle';
import {
	requestAddProduct,
	requestUpdateProduct,
	requestDeleteProduct,
} from 'state/memberships/product-list/actions';

// These are Stripe settlement currencies.
const CURRENCIES = [
	'USD',
	'AUD',
	'BRL',
	'CAD',
	'CHF',
	'DKK',
	'EUR',
	'GBP',
	'HKD',
	'JPY',
	'MXN',
	'NOK',
	'NZD',
	'SEK',
	'SGD',
];

const currencyList = CURRENCIES.map( code => ( { code } ) );

class MembershipsProductsSection extends Component {
	constructor() {
		super();
		this.onCloseDialog = this.onCloseDialog.bind( this );
	}
	state = {
		showDialog: false,
		editedProductId: null,
		deletedProductId: null,
		editedProductName: '',
		editedPayWhatYouWant: false,
		editedMultiplePerUser: false,
		editedPrice: { currency: 'USD', value: '' },
		editedSchedule: '1 month',
		focusedName: false,
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

	onCloseDialog = reason => {
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
				},
				this.props.translate( 'Updated "%s" product.', { args: this.state.editedProductName } )
			);
		}
		this.setState( { showDialog: false, editedProductId: null } );
	};

	openProductDialog = editedProductId => {
		if ( editedProductId ) {
			const product = this.props.products.filter( prod => prod.ID === editedProductId ).pop();
			this.setState( {
				showDialog: true,
				editedProductId,
				editedProductName: product.title,
				editedPrice: {
					currency: product.currency,
					value: product.price,
				},
				editedSchedule: product.renewal_schedule,
				editedPayWhatYouWant: product.buyer_can_change_amount,
				editedMultiplePerUser: !! product.multiple_per_user,
				focusedName: false,
			} );
		} else {
			this.setState( {
				showDialog: true,
				editedProductId,
				editedProductName: '',
				editedPrice: {
					currency: 'USD',
					value: 5.0,
				},
				editedSchedule: '1 month',
				editedPayWhatYouWant: false,
				editedMultiplePerUser: false,
				focusedName: false,
			} );
		}
	};
	onCloseDeleteProduct = reason => {
		if ( reason === 'delete' ) {
			const product = this.props.products.filter( p => p.ID === this.state.deletedProductId ).pop();
			this.props.requestDeleteProduct(
				this.props.siteId,
				product,
				this.props.translate( '"%s" was deleted.', { args: product.title } )
			);
		}
		this.setState( { deletedProductId: null } );
	};
	handleCurrencyChange = event => {
		const { value: currency } = event.currentTarget;

		this.setState( state => ( {
			editedPrice: { ...state.editedPrice, currency },
		} ) );
	};
	handlePriceChange = event => {
		const value = parseFloat( event.currentTarget.value );

		this.setState( state => ( {
			editedPrice: { ...state.editedPrice, value },
		} ) );
	};
	handlePayWhatYouWant = newValue => this.setState( { editedPayWhatYouWant: newValue } );
	handleMultiplePerUser = newValue => this.setState( { editedMultiplePerUser: newValue } );

	onNameChange = event => this.setState( { editedProductName: event.target.value } );
	onSelectSchedule = event => this.setState( { editedSchedule: event.target.value } );
	isFormValid = field => {
		if ( ( field === 'price' || ! field ) && this.state.editedPrice.value < 5.0 ) {
			return false;
		}
		if ( ( field === 'name' || ! field ) && this.state.editedProductName.length === 0 ) {
			return false;
		}
		return true;
	};

	renderEditDialog() {
		return (
			<Dialog
				isVisible={ this.state.showDialog }
				onClose={ this.onCloseDialog }
				buttons={ [
					{
						label: this.props.translate( 'Cancel' ),
						action: 'cancel',
					},
					{
						label: this.state.editedProductId
							? this.props.translate( 'Edit' )
							: this.props.translate( 'Add' ),
						action: 'submit',
						disabled: ! this.isFormValid(),
					},
				] }
			>
				<FormSectionHeading>
					{ this.state.editedProductId && this.props.translate( 'Edit' ) }
					{ ! this.state.editedProductId &&
						this.props.translate( 'Add New Recurring Payment plan' ) }
				</FormSectionHeading>
				<p>
					{ this.state.editedProductId &&
						this.props.translate( 'Edit your existing Recurring Payments plan.' ) }
					{ ! this.state.editedProductId &&
						this.props.translate(
							'Each amount you add will create a separate Recurring Payments plan. You can create multiple plans.'
						) }
				</p>
				<FormFieldset>
					<FormLabel htmlFor="currency">{ this.props.translate( 'Select price' ) }</FormLabel>
					{ this.state.editedProductId && (
						<Notice
							text={ this.props.translate(
								'Updating the price will not affect existing subscribers, who will pay what they were originally charged.'
							) }
							showDismiss={ false }
						/>
					) }
					<FormCurrencyInput
						name="currency"
						id="currency"
						min="5.00"
						value={ this.state.editedPrice.value }
						onChange={ this.handlePriceChange }
						currencySymbolPrefix={ this.state.editedPrice.currency }
						onCurrencyChange={ this.handleCurrencyChange }
						currencyList={ currencyList }
						placeholder="0.00"
					/>
					{ ! this.isFormValid( 'price' ) && (
						<FormInputValidation
							isError
							text={ this.props.translate( 'Please enter a price higher than 5.00' ) }
						/>
					) }
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="renewal_schedule">
						{ this.props.translate( 'Select renewal schedule' ) }
					</FormLabel>
					<FormSelect
						id="renewal_schedule"
						value={ this.state.editedSchedule }
						onChange={ this.onSelectSchedule }
					>
						<option value="1 month">{ this.props.translate( 'Monthly' ) }</option>
						<option value="1 year">{ this.props.translate( 'Yearly' ) }</option>
					</FormSelect>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="title">
						{ this.props.translate( 'Please describe your subscription' ) }
					</FormLabel>
					<FormTextInput
						id="title"
						value={ this.state.editedProductName }
						onChange={ this.onNameChange }
						onBlur={ () => this.setState( { focusedName: true } ) }
					/>
					{ ! this.isFormValid( 'name' ) && this.state.focusedName && (
						<FormInputValidation isError text={ this.props.translate( 'Please input a name.' ) } />
					) }
				</FormFieldset>
				<FormFieldset>
					<FormToggle
						onChange={ this.handlePayWhatYouWant }
						checked={ this.state.editedPayWhatYouWant }
					>
						{ this.props.translate(
							'Enable customers to pick their own amount ("Pay what you want").'
						) }
					</FormToggle>
				</FormFieldset>
				<FormFieldset>
					<FormToggle
						onChange={ this.handleMultiplePerUser }
						checked={ this.state.editedMultiplePerUser }
					>
						{ this.props.translate(
							'Allow the same customer to sign up multiple times to the same plan.'
						) }
					</FormToggle>
				</FormFieldset>
			</Dialog>
		);
	}

	render() {
		return (
			<div>
				<QueryMembershipProducts siteId={ this.props.siteId } />
				<HeaderCake backHref={ '/earn/payments/' + this.props.siteSlug }>
					{ this.props.translate( 'Recurring Payments plans' ) }
				</HeaderCake>
				{ this.renderEditDialog() }

				<SectionHeader>
					<Button primary compact onClick={ () => this.openProductDialog( null ) }>
						{ this.props.translate( 'Add new plan' ) }
					</Button>
				</SectionHeader>
				{ this.props.products.map( product => (
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
								this.props.products.filter( p => p.ID === this.state.deletedProductId ),
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

export default connect(
	state => {
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
