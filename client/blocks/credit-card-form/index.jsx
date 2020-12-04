/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { camelCase, values } from 'lodash';
import { connect } from 'react-redux';
import debugFactory from 'debug';
import { Card } from '@automattic/components';
import {
	createStripeSetupIntent,
	StripeSetupIntentError,
	StripeValidationError,
	useStripe,
} from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import CreditCardFormFields from 'calypso/components/credit-card-form-fields';
import FormButton from 'calypso/components/forms/form-button';
import notices from 'calypso/notices';
import { validatePaymentDetails } from 'calypso/lib/checkout';
import ValidationErrorList from 'calypso/notices/validation-error-list';
import { AUTO_RENEWAL, MANAGE_PURCHASES } from 'calypso/lib/url/support';
import getCountries from 'calypso/state/selectors/get-countries';
import QueryPaymentCountries from 'calypso/components/data/query-countries/payments';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import {
	getInitializedFields,
	camelCaseFormFields,
	kebabCaseFormFields,
	assignAllFormFields,
	areFormFieldsEmpty,
	useDebounce,
	saveOrUpdateCreditCard,
	makeAsyncCreateCardToken,
} from './helpers';

/**
 * Style dependencies
 */
import './style.scss';

const debug = debugFactory( 'calypso:credit-card-form' );

export function CreditCardForm( {
	apiParams = {},
	createCardToken,
	countriesList,
	initialValues = undefined,
	purchase = undefined,
	recordFormSubmitEvent,
	saveStoredCard = null,
	siteSlug = undefined,
	successCallback,
	autoFocus = true,
	heading = undefined,
	onCancel = undefined,
	translate,
} ) {
	const {
		stripe,
		stripeConfiguration,
		setStripeError,
		isStripeLoading,
		stripeLoadingError,
	} = useStripe();
	const [ formSubmitting, setFormSubmitting ] = useState( false );
	const [ formFieldValues, setFormFieldValues ] = useState( getInitializedFields( initialValues ) );
	const [ touchedFormFields, setTouchedFormFields ] = useState( {} );
	const [ formFieldErrors, setFormFieldErrors ] = useState(
		camelCaseFormFields(
			validatePaymentDetails(
				kebabCaseFormFields( formFieldValues ),
				stripe ? 'stripe' : 'credit-card'
			).errors
		)
	);
	const [ debouncedFieldErrors, setDebouncedFieldErrors ] = useDebounce( formFieldErrors, 1000 );

	const onFieldChange = ( rawDetails ) => {
		const newValues = { ...formFieldValues, ...camelCaseFormFields( rawDetails ) };
		setFormFieldValues( newValues );
		setTouchedFormFields( { ...touchedFormFields, ...camelCaseFormFields( rawDetails ) } );
		// Clear the errors of updated fields when typing then display them again after debounce
		const clearedErrors = assignAllFormFields( camelCaseFormFields( rawDetails ), [] );
		setDebouncedFieldErrors( { ...debouncedFieldErrors, ...clearedErrors } );
		// Debounce updating validation errors
		setFormFieldErrors(
			camelCaseFormFields(
				validatePaymentDetails(
					kebabCaseFormFields( newValues ),
					stripe ? 'stripe' : 'credit-card'
				).errors
			)
		);
	};

	const getErrorMessage = ( fieldName ) => {
		const camelName = camelCase( fieldName );
		if ( touchedFormFields[ camelName ] ) {
			return debouncedFieldErrors[ camelName ];
		}
		return formFieldValues[ camelName ] && debouncedFieldErrors[ camelName ];
	};

	const onSubmit = async ( event ) => {
		event.preventDefault();

		if ( formSubmitting ) {
			return;
		}
		setFormSubmitting( true );

		try {
			setTouchedFormFields( formFieldErrors );
			if ( ! areFormFieldsEmpty( formFieldErrors ) ) {
				throw new Error( translate( 'Your credit card information is not valid' ) );
			}
			recordFormSubmitEvent();
			const createCardTokenAsync = makeAsyncCreateCardToken( createCardToken );
			const createStripeSetupIntentAsync = async ( paymentDetails ) => {
				const { name, country, 'postal-code': zip } = paymentDetails;
				const paymentDetailsForStripe = {
					name,
					address: {
						country: country,
						postal_code: zip,
					},
				};
				return createStripeSetupIntent( stripe, stripeConfiguration, paymentDetailsForStripe );
			};
			const parseStripeToken = ( response ) => response.payment_method;
			const parsePaygateToken = ( response ) => response.token;
			await saveOrUpdateCreditCard( {
				createCardToken: stripe ? createStripeSetupIntentAsync : createCardTokenAsync,
				saveStoredCard,
				translate,
				apiParams,
				purchase,
				siteSlug,
				formFieldValues,
				stripeConfiguration,
				parseTokenFromResponse: stripe ? parseStripeToken : parsePaygateToken,
			} );
			successCallback();
		} catch ( error ) {
			debug( 'Error while submitting', error );
			setFormSubmitting( false );
			error && setStripeError && setStripeError( error );
			error && displayError( { translate, error } );
		}
	};

	useEffect( () => {
		if ( stripeLoadingError ) {
			displayError( { translate, error: stripeLoadingError } );
		}
	}, [ stripeLoadingError, translate ] );

	const disabled = isStripeLoading || stripeLoadingError;

	return (
		<form onSubmit={ onSubmit }>
			<Card className="credit-card-form__content">
				{ heading && <div className="credit-card-form__heading">{ heading }</div> }
				<QueryPaymentCountries />
				<CreditCardFormFields
					card={ kebabCaseFormFields( formFieldValues ) }
					countriesList={ countriesList }
					eventFormName="Edit Card Details Form"
					onFieldChange={ onFieldChange }
					getErrorMessage={ getErrorMessage }
					autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
				/>
				<div className="credit-card-form__card-terms">
					<Gridicon icon="info-outline" size={ 18 } />
					<p>
						<TosText translate={ translate } />
					</p>
				</div>

				<SaveButton
					translate={ translate }
					disabled={ disabled }
					formSubmitting={ formSubmitting }
				/>

				{ onCancel && (
					<FormButton type="button" isPrimary={ false } onClick={ onCancel }>
						{ translate( 'Cancel' ) }
					</FormButton>
				) }
			</Card>
		</form>
	);
}

CreditCardForm.propTypes = {
	apiParams: PropTypes.object,
	createCardToken: PropTypes.func.isRequired,
	countriesList: PropTypes.array.isRequired,
	initialValues: PropTypes.object,
	purchase: PropTypes.object,
	recordFormSubmitEvent: PropTypes.func.isRequired,
	saveStoredCard: PropTypes.func,
	siteSlug: PropTypes.string,
	successCallback: PropTypes.func.isRequired,
	autoFocus: PropTypes.bool,
	heading: PropTypes.string,
	onCancel: PropTypes.func,
	translate: PropTypes.func.isRequired,
};

function SaveButton( { translate, disabled, formSubmitting } ) {
	return (
		<FormButton disabled={ disabled || formSubmitting } type="submit">
			{ formSubmitting
				? translate( 'Saving card…', {
						context: 'Button label',
						comment: 'Credit card',
				  } )
				: translate( 'Save card', {
						context: 'Button label',
						comment: 'Credit card',
				  } ) }
		</FormButton>
	);
}

function TosText( { translate } ) {
	return translate(
		'By saving a credit card, you agree to our {{tosLink}}Terms of Service{{/tosLink}}, and if ' +
			'you use it to pay for a subscription or plan, you authorize your credit card to be charged ' +
			'on a recurring basis until you cancel, which you can do at any time. ' +
			'You understand {{autoRenewalSupportPage}}how your subscription works{{/autoRenewalSupportPage}} ' +
			'and {{managePurchasesSupportPage}}how to cancel{{/managePurchasesSupportPage}}.',
		{
			components: {
				tosLink: (
					<a
						href={ localizeUrl( 'https://wordpress.com/tos/' ) }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
				autoRenewalSupportPage: (
					<a href={ AUTO_RENEWAL } target="_blank" rel="noopener noreferrer" />
				),
				managePurchasesSupportPage: (
					<a href={ MANAGE_PURCHASES } target="_blank" rel="noopener noreferrer" />
				),
			},
		}
	);
}

function StripeError( { translate } ) {
	return (
		<div>
			{ translate(
				'There was a problem with your credit card. Please check your information and try again.'
			) }
		</div>
	);
}

function displayError( { translate, error } ) {
	if ( error instanceof StripeSetupIntentError || error instanceof StripeValidationError ) {
		notices.error( <StripeError translate={ translate } /> );
		return;
	}
	if ( typeof error.message === 'object' ) {
		notices.error( <ValidationErrorList messages={ values( error.message ) } /> );
		return;
	}
	notices.error( error.message );
}

export default connect( ( state ) => ( {
	countriesList: getCountries( state, 'payments' ),
} ) )( localize( CreditCardForm ) );
