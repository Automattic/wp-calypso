/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import formatCurrency from '@automattic/format-currency';
/**
 * Internal dependencies
 */
import './style.scss';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import HeaderCake from 'components/header-cake';
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import QueryMembershipProducts from 'components/data/query-memberships';
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import Gridicon from 'components/gridicon';
import Dialog from 'components/dialog';
import FormInputValidation from 'components/forms/form-input-validation';
import FormTextInput from 'components/forms/form-text-input';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormSelect from 'components/forms/form-select';
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormLabel from 'components/forms/form-label';
import FormFieldset from 'components/forms/form-fieldset';

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
		editedProductName: '',
		editedPrice: { currency: 'USD', value: '' },
		editedSchedule: '1 month',
	};
	renderEllipsisMenu( productId ) {
		return (
			<EllipsisMenu position="bottom left">
				<PopoverMenuItem onClick={ () => this.openProductDialog( productId ) }>
					<Gridicon size={ 18 } icon={ 'pencil' } />
					{ this.props.translate( 'Edit' ) }
				</PopoverMenuItem>
				<PopoverMenuItem>
					<Gridicon size={ 18 } icon={ 'trash' } />
					{ this.props.translate( 'Delete' ) }
				</PopoverMenuItem>
			</EllipsisMenu>
		);
	}

	onCloseDialog = () => {
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
			} );
		} else {
			this.setState( {
				showDialog: true,
				editedProductId,
				editedProductName: '',
				editedPrice: {
					currency: 'USD',
					value: 0.0,
				},
				editedSchedule: '1 month',
			} );
		}
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
					{ ! this.state.editedProductId && this.props.translate( 'Add New Membership Amount' ) }
				</FormSectionHeading>
				<p>
					{ this.props.translate(
						'You can add multiple membership amounts, each of which will allow you to generate a membership button.'
					) }
				</p>
				<FormFieldset>
					<FormLabel htmlFor="currency">{ this.props.translate( 'Select price' ) }</FormLabel>
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
					/>
					{ ! this.isFormValid( 'name' ) && (
						<FormInputValidation isError text={ this.props.translate( 'Please input a name.' ) } />
					) }
				</FormFieldset>
			</Dialog>
		);
	}

	render() {
		return (
			<div>
				<QueryMembershipProducts siteId={ this.props.siteId } />
				<HeaderCake backHref={ '/earn/memberships/' + this.props.siteSlug }>
					{ this.props.translate( 'Membership Amounts' ) }
				</HeaderCake>
				{ this.renderEditDialog() }

				<SectionHeader>
					<Button primary compact onClick={ () => this.openProductDialog( null ) }>
						{ this.props.translate( 'Add new amount' ) }
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
	{}
)( localize( MembershipsProductsSection ) );
