/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { reduxForm, Fields, getFormValues, isValid, isDirty } from 'redux-form';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { flowRight as compose, omit, padEnd, trimEnd } from 'lodash';
import { getCurrencyDefaults } from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import FormCurrencyInput from 'components/forms/form-currency-input';
import ReduxFormFieldset, { FieldsetRenderer } from 'components/redux-forms/redux-form-fieldset';
import FormSelect from 'components/forms/form-select';
import QueryMembershipsConnectedAccounts from 'components/data/query-memberships-connected-accounts';
import Button from '@automattic/components/button';
import { authorizeStripeAccount } from 'state/memberships/connected-accounts/actions';
import getEditedSimplePaymentsStripeAccount from 'state/selectors/get-edited-simple-payments-stripe-account';
import getMembershipsConnectedAccounts from 'state/selectors/get-memberships-connected-accounts';

export const REDUX_FORM_NAME = 'membershipsForm';

// Export some selectors that are needed by the code that submits the form
export const getProductFormValues = state => getFormValues( REDUX_FORM_NAME )( state );
export const isProductFormValid = state => isValid( REDUX_FORM_NAME )( state );
export const isProductFormDirty = state => isDirty( REDUX_FORM_NAME )( state );

// https://developer.paypal.com/docs/integration/direct/rest/currency-codes/
const SUPPORTED_CURRENCY_LIST = [
	'USD',
	'EUR',
	'AUD',
	'BRL',
	'CAD',
	'CZK',
	'DKK',
	'HKD',
	'HUF',
	'ILS',
	'JPY',
	'MYR',
	'MXN',
	'TWD',
	'NZD',
	'NOK',
	'PHP',
	'PLN',
	'GBP',
	'RUB',
	'SGD',
	'SEK',
	'CHF',
	'THB',
];

const VISUAL_CURRENCY_LIST = SUPPORTED_CURRENCY_LIST.map( code => {
	const { symbol } = getCurrencyDefaults( code );
	// if symbol is equal to the code (e.g., 'CHF' === 'CHF'), don't duplicate it.
	// trim the dot at the end, e.g., 'kr.' becomes 'kr'
	const label = symbol === code ? code : `${ code } ${ trimEnd( symbol, '.' ) }`;
	return { code, label };
} );

// based on https://stackoverflow.com/a/10454560/59752
function decimalPlaces( number ) {
	const match = ( '' + number ).match( /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/ );
	if ( ! match ) {
		return 0;
	}
	return Math.max( 0, ( match[ 1 ] ? match[ 1 ].length : 0 ) - ( match[ 2 ] ? +match[ 2 ] : 0 ) );
}

// Validation function for the form
const validate = ( values, props ) => {
	// The translate function was passed as a prop to the `reduxForm()` wrapped component
	const { translate } = props;
	const { precision } = getCurrencyDefaults( values.currency );
	const errors = {};

	if ( ! values.title ) {
		errors.title = translate(
			"People need to know what they're paying for! Please add a brief title."
		);
	}

	if ( ! values.price || parseFloat( values.price ) === 0 ) {
		errors.price = translate( 'Everything comes with a price tag these days. Add yours here.' );
	} else if ( isNaN( parseFloat( values.price ) ) ) {
		errors.price = translate( 'Invalid price' );
	} else if ( parseFloat( values.price ) < 0 ) {
		errors.price = translate( "Your price is negative — now that doesn't sound right, does it?" );
	} else if ( decimalPlaces( values.price ) > precision ) {
		if ( precision === 0 ) {
			errors.price = translate(
				"We know every penny counts, but prices can't contain decimal values."
			);
		} else {
			const countDecimal = translate(
				'%(precision)d decimal place',
				'%(precision)d decimal places',
				{
					count: precision,
					args: {
						precision,
					},
				}
			);
			errors.price = translate( 'Price cannot have more than %(countDecimal)s.', {
				args: { countDecimal },
			} );
		}
	}

	if ( ! values.renewal_schedule ) {
		errors.renewal_schedule = 'Please choose a renewal schedule';
	}

	if ( ! values.stripe_account ) {
		errors.stripe_account = 'Choose or connect a new Stripe Account.';
	}

	if ( values.stripe_account === 'create' && ! values.email ) {
		errors.email = translate(
			'If you want us to create a Stripe account for you, you need to provide an email address.'
		);
	}
	return errors;
};

// The 'price' input displays data from two fields: `price` and `currency`. That's why we
// render it using the `Fields` component instead of `Field`. We need this rendering wrapper
// to transform the props from `{ price: { input, meta }, currency: { input, meta } }` that
// `Fields` is receiving to `{ input, meta }` that `Field` expects.
const renderPriceField = ( { price, currency, ...props } ) => {
	const { precision } = getCurrencyDefaults( currency.input.value );
	// Tune the placeholder to the precision value: 0 -> '1', 1 -> '1.0', 2 -> '1.00'
	const placeholder = precision > 0 ? padEnd( '1.', precision + 2, '0' ) : '1';
	return (
		<FieldsetRenderer
			inputComponent={ FormCurrencyInput }
			{ ...price }
			{ ...omit( props, [ 'names' ] ) }
			currencySymbolPrefix={ currency.input.value }
			onCurrencyChange={ currency.input.onChange }
			currencyList={ VISUAL_CURRENCY_LIST }
			placeholder={ placeholder }
		/>
	);
};

class ProductForm extends Component {
	render() {
		const { translate } = this.props;

		return (
			<form className="editor-simple-payments-modal__form">
				<div className="editor-simple-payments-modal__form-fields">
					<ReduxFormFieldset
						name="title"
						label={ translate( 'What is this payment for?' ) }
						component={ FormTextInput }
						explanation={ translate(
							'For example: event tickets, charitable donations, training courses, coaching fees, etc.'
						) }
					/>
					<ReduxFormFieldset
						name="description"
						label={ translate( 'Description' ) }
						component={ FormTextarea }
					/>
					<Fields
						names={ [ 'price', 'currency' ] }
						label={ translate( 'Price' ) }
						component={ renderPriceField }
					/>
					{ this.renderRecurringFields() }
				</div>
			</form>
		);
	}

	renderRecurringFields() {
		const { translate } = this.props;
		return (
			<div>
				<QueryMembershipsConnectedAccounts />
				<ReduxFormFieldset
					name="stripe_account"
					explanation={ translate( 'This is the Stripe account where the funds will end up.' ) }
					label={ translate( 'Stripe account' ) }
					component={ FormSelect }
					children={ Object.values( this.props.membershipsConnectedAccounts )
						.map( acct => (
							<option
								value={ acct.connected_destination_account_id }
								key={ acct.connected_destination_account_id }
							>
								{ acct.payment_partner_account_id }
							</option>
						) )
						.concat( [
							<option value="create" key="create">
								{ translate( 'Create Stripe account for me' ) }
							</option>,
							<option value="authorize" key="authorize">
								{ translate( 'I already have a Stripe account' ) }
							</option>,
						] ) }
				/>
				{ this.props.isChoosingToAuthorizeStripeAccount && (
					<Button onClick={ this.props.authorizeStripeAccount }>
						{ translate( 'Authorize Stripe account' ) }
					</Button>
				) }
				{ this.props.isChoosingToCreateStripeAccount && (
					<div>
						<ReduxFormFieldset
							name="email"
							label={ translate( 'Email' ) }
							explanation={ translate( 'New Stripe account will be tied to this email address.' ) }
							component={ FormTextInput }
						/>
					</div>
				) }
				<ReduxFormFieldset
					name="renewal_schedule"
					explanation={ translate( 'After what time should the subscription renew?' ) }
					label={ translate( 'Renewal Schedule' ) }
					component={ FormSelect }
				>
					<option value="1 month">{ translate( '1 Month' ) }</option>
					<option value="1 year">{ translate( '1 Year' ) }</option>
				</ReduxFormFieldset>
			</div>
		);
	}
}

export default compose(
	localize, // must be the outer HOC, as the validation function relies on `translate` prop
	reduxForm( {
		form: REDUX_FORM_NAME,
		enableReinitialize: true,
		validate,
	} ),
	connect(
		state => {
			return {
				isChoosingToAuthorizeStripeAccount:
					getEditedSimplePaymentsStripeAccount( state, REDUX_FORM_NAME ) === 'authorize',
				isChoosingToCreateStripeAccount:
					getEditedSimplePaymentsStripeAccount( state, REDUX_FORM_NAME ) === 'create',
				membershipsConnectedAccounts: getMembershipsConnectedAccounts( state ),
			};
		},
		{ authorizeStripeAccount }
	)
)( ProductForm );
