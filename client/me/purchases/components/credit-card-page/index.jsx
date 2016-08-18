/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal Dependencies
 */
import camelCase from 'lodash/camelCase';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import { createPaygateToken } from 'lib/store-transactions';
import CreditCardForm from 'components/upgrades/credit-card-form';
import CountriesList from 'lib/countries-list';
import FormButton from 'components/forms/form-button';
import formState from 'lib/form-state';
import forOwn from 'lodash/forOwn';
import HeaderCake from 'components/header-cake' ;
import kebabCase from 'lodash/kebabCase';
import Main from 'components/main';
import mapKeys from 'lodash/mapKeys';
import notices from 'notices';
import { validateCardDetails } from 'lib/credit-card-details';
import ValidationErrorList from 'notices/validation-error-list';
import wpcomFactory from 'lib/wp';
import Gridicon from 'components/gridicon';
import support from 'lib/url/support';

const countriesList = CountriesList.forPayments();
const wpcom = wpcomFactory.undocumented();

const CreditCardPage = React.createClass( {
	propTypes: {
		apiParams: PropTypes.object,
		goBack: PropTypes.func.isRequired,
		initialValues: PropTypes.object,
		recordFormSubmitEvent: PropTypes.func.isRequired,
		successCallback: PropTypes.func.isRequired,
		title: PropTypes.string.isRequired
	},

	getInitialState() {
		return {
			form: null,
			formSubmitting: false,
			notice: null
		};
	},

	_mounted: false,

	fieldNames: [
		'name',
		'number',
		'cvv',
		'expirationDate',
		'country',
		'postalCode'
	],

	componentWillMount() {
		this._mounted = true;

		const fields = formState.createNullFieldValues( this.fieldNames );

		if ( this.props.initialValues ) {
			fields.name = this.props.initialValues.name;
		}

		this.formStateController = formState.Controller( {
			initialFields: fields,
			onNewState: this.setFormState,
			validatorFunction: this.validate
		} );

		this.setState( {
			form: this.formStateController.getInitialState()
		} );
	},

	componentWillUnmount() {
		this._mounted = false;
	},

	validate( formValues, onComplete ) {
		if ( ! this._mounted ) {
			return;
		}

		onComplete( null, this.getValidationErrors() );
	},

	setFormState( form ) {
		if ( ! this._mounted ) {
			return;
		}

		const messages = formState.getErrorMessages( form );

		if ( messages.length > 0 ) {
			const notice = notices.error( <ValidationErrorList messages={ messages } /> );

			this.setState( {
				form,
				notice
			} );
		} else {
			if ( this.state.notice ) {
				notices.removeNotice( this.state.notice );
			}
			this.setState( {
				form,
				notice: null
			} );
		}
	},

	onFieldChange( rawDetails ) {
		// Maps params from CreditCardForm component to work with formState.
		forOwn( rawDetails, ( value, name ) => {
			this.formStateController.handleFieldChange( {
				name,
				value
			} );
		} );
	},

	onSubmit( event ) {
		event.preventDefault();

		if ( this.state.formSubmitting ) {
			return;
		}

		this.setState( { formSubmitting: true } );

		this.formStateController.handleSubmit( ( hasErrors ) => {
			if ( hasErrors ) {
				this.setState( { formSubmitting: false } );
				return;
			}

			this.props.recordFormSubmitEvent();

			this.saveCreditCard();
		} );
	},

	saveCreditCard() {
		const cardDetails = this.getCardDetails();

		createPaygateToken( 'card_update', cardDetails, ( paygateError, token ) => {
			if ( ! this._mounted ) {
				return;
			}

			if ( paygateError ) {
				this.setState( { formSubmitting: false } );
				notices.error( paygateError.message );
				return;
			}

			const apiParams = this.getParamsForApi( cardDetails, token, this.props.apiParams );

			wpcom.updateCreditCard( apiParams, ( apiError, response ) => {
				if ( apiError ) {
					if ( this._mounted ) {
						this.setState( { formSubmitting: false } );
					}
					notices.error( apiError.message );
					return;
				}

				if ( response.error ) {
					if ( this._mounted ) {
						this.setState( { formSubmitting: false } );
					}
					notices.error( response.error );
					return;
				}

				notices.success( response.success, {
					persistent: true
				} );

				this.props.successCallback();
			} );
		} );
	},

	getParamsForApi( cardDetails, token, extraParams = {} ) {
		return {
			...extraParams,
			country: cardDetails.country,
			zip: cardDetails[ 'postal-code' ],
			month: cardDetails[ 'expiration-date' ].split( '/' )[ 0 ],
			year: cardDetails[ 'expiration-date' ].split( '/' )[ 1 ],
			name: cardDetails.name,
			paygateToken: token
		};
	},

	isFieldInvalid( name ) {
		return formState.isFieldInvalid( this.state.form, name );
	},

	getValidationErrors() {
		const validationResult = validateCardDetails( this.getCardDetails() );

		// Maps keys from credit card validator to work with formState.
		return mapKeys( validationResult.errors, ( value, key ) => {
			return camelCase( key );
		} );
	},

	getCardDetails() {
		// Maps keys from formState to work with CreditCardForm component and credit card validator.
		return mapKeys( formState.getAllFieldValues( this.state.form ), ( value, key ) => {
			return kebabCase( key );
		} );
	},

	render() {
		return (
			<Main className="credit-card-page">
				<HeaderCake onClick={ this.props.goBack }>{ this.props.title }</HeaderCake>

				<form onSubmit={ this.onSubmit }>
					<Card className="credit-card-page__content">
						<CreditCardForm
							card={ this.getCardDetails() }
							countriesList={ countriesList }
							eventFormName="Edit Card Details Form"
							isFieldInvalid={ this.isFieldInvalid }
							onFieldChange={ this.onFieldChange } />
						<div className="credit-card-page__card-terms" onClick={ this.recordTermsAndConditionsClick }>
							<Gridicon icon="info-outline" size={ 18 } />
							<p>
								{ this.translate(
									'By saving a credit card, you agree to our {{tosLink}}Terms of Service{{/tosLink}} and authorize ' +
									'your credit card to be charged on a recurring basis until you cancel, which you can do at any time. ' +
									'You understand {{autoRenewalSupportPage}}how your subscription works{{/autoRenewalSupportPage}} ' +
									'and {{managePurchasesSupportPage}}how to cancel{{/managePurchasesSupportPage}}.',
									{
										components: {
											tosLink: <a href="//wordpress.com/tos/" target="_blank"/>,
											autoRenewalSupportPage: <a href={ support.AUTO_RENEWAL } target="_blank"/>,
											managePurchasesSupportPage: <a href={ support.MANAGE_PURCHASES } target="_blank"/>
										}
									}
								) }
							</p>
						</div>
					</Card>

					<CompactCard className="credit-card-page__footer">
						<em>{ this.translate( 'All fields required' ) }</em>

						<FormButton
							disabled={ this.state.formSubmitting }
							type="submit">
							{ this.state.formSubmitting
								? this.translate( 'Saving Card…', { context: 'Button label', comment: 'Credit card' } )
								: this.translate( 'Save Card', { context: 'Button label', comment: 'Credit card' } ) }
						</FormButton>
					</CompactCard>
				</form>
			</Main>
		);
	}
} );

export default CreditCardPage;
