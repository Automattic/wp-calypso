/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { camelCase, forOwn, kebabCase, mapKeys, values } from 'lodash';
import { connect } from 'react-redux';
import GridiconInfoOutline from 'gridicons/dist/info-outline';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import config from 'config';
import CreditCardFormFields from 'components/credit-card-form-fields';
import FormButton from 'components/forms/form-button';
import formState from 'lib/form-state';
import notices from 'notices';
import { validatePaymentDetails } from 'lib/checkout';
import { handleRenewNowClick, isRenewable } from 'lib/purchases';
import ValidationErrorList from 'notices/validation-error-list';
import wpcomFactory from 'lib/wp';
import { AUTO_RENEWAL, MANAGE_PURCHASES } from 'lib/url/support';
import getCountries from 'state/selectors/get-countries';
import QueryPaymentCountries from 'components/data/query-countries/payments';

const wpcom = wpcomFactory.undocumented();

export class CreditCardForm extends Component {
	static displayName = 'CreditCardForm';

	static propTypes = {
		apiParams: PropTypes.object,
		createCardToken: PropTypes.func.isRequired,
		countriesList: PropTypes.array.isRequired,
		initialValues: PropTypes.object,
		purchase: PropTypes.object,
		recordFormSubmitEvent: PropTypes.func.isRequired,
		saveStoredCard: PropTypes.func,
		siteSlug: PropTypes.string,
		successCallback: PropTypes.func.isRequired,
		showUsedForExistingPurchasesInfo: PropTypes.bool,
		autoFocus: PropTypes.bool,
		heading: PropTypes.string,
		onCancel: PropTypes.func,
	};

	static defaultProps = {
		apiParams: {},
		initialValues: {},
		saveStoredCard: null,
		showUsedForExistingPurchasesInfo: false,
		autoFocus: true,
	};

	state = {
		form: null,
		formSubmitting: false,
		notice: null,
	};

	fieldNames = [
		'name',
		'number',
		'cvv',
		'expirationDate',
		'country',
		'postalCode',
		'streetNumber',
		'address1',
		'address2',
		'phoneNumber',
		'streetNumber',
		'city',
		'state',
		'document',
		'brand',
	];

	componentWillMount() {
		const fields = this.fieldNames.reduce( ( result, fieldName ) => {
			return { ...result, [ fieldName ]: '' };
		}, {} );

		if ( this.props.initialValues ) {
			fields.name = this.props.initialValues.name;
		}

		this.formStateController = formState.Controller( {
			initialFields: fields,
			onNewState: this.setFormState,
			validatorFunction: this.validate,
		} );

		this.setState( {
			form: this.formStateController.getInitialState(),
		} );
	}

	storeForm = ref => ( this.formElem = ref );

	validate = ( formValues, onComplete ) =>
		this.formElem && onComplete( null, this.getValidationErrors() );

	setFormState = form => this.formElem && this.setState( { form } );

	endFormSubmitting = () => this.formElem && this.setState( { formSubmitting: false } );

	onFieldChange = rawDetails => {
		// Maps params from CreditCardFormFields component to work with formState.
		forOwn( rawDetails, ( value, name ) => {
			this.formStateController.handleFieldChange( {
				name,
				value,
			} );
		} );
	};

	getErrorMessage = fieldName => formState.getFieldErrorMessages( this.state.form, fieldName );

	onSubmit = event => {
		event.preventDefault();

		if ( this.state.formSubmitting ) {
			return;
		}

		this.setState( { formSubmitting: true } );

		this.formStateController.handleSubmit( hasErrors => {
			if ( hasErrors ) {
				this.setState( { formSubmitting: false } );
				return;
			}

			this.props.recordFormSubmitEvent();

			this.saveCreditCard();
		} );
	};

	saveCreditCard() {
		const {
			createCardToken,
			saveStoredCard,
			translate,
			successCallback,
			apiParams,
			purchase,
			siteSlug,
		} = this.props;
		const cardDetails = this.getCardDetails();

		createCardToken( cardDetails, ( gatewayError, gatewayData ) => {
			if ( ! this.formElem ) {
				return;
			}

			if ( gatewayError ) {
				this.setState( { formSubmitting: false } );
				notices.error( gatewayError.message );
				return;
			}

			if ( saveStoredCard ) {
				saveStoredCard( gatewayData )
					.then( () => {
						notices.success( translate( 'Card added successfully' ), {
							persistent: true,
						} );

						successCallback();
					} )
					.catch( ( { message } ) => {
						this.endFormSubmitting();

						if ( typeof message === 'object' ) {
							notices.error( <ValidationErrorList messages={ values( message ) } /> );
						} else {
							notices.error( message );
						}
					} );
			} else {
				const updatedCreditCardApiParams = this.getParamsForApi(
					cardDetails,
					gatewayData.token,
					apiParams
				);

				wpcom.updateCreditCard( updatedCreditCardApiParams, ( apiError, response ) => {
					if ( apiError ) {
						this.endFormSubmitting();
						notices.error( apiError.message );
						return;
					}

					if ( response.error ) {
						this.endFormSubmitting();
						notices.error( response.error );
						return;
					}

					if (
						purchase &&
						siteSlug &&
						isRenewable( purchase ) &&
						config.isEnabled( 'upgrades/checkout' )
					) {
						const noticeMessage = translate(
							'Your credit card details were successfully updated, but your subscription has not been renewed yet.'
						);
						const noticeOptions = {
							button: translate( 'Renew Now' ),
							onClick: function( event, closeFunction ) {
								handleRenewNowClick( purchase, siteSlug );
								closeFunction();
							},
							persistent: true,
						};
						notices.info( noticeMessage, noticeOptions );
					} else {
						notices.success( response.success, {
							persistent: true,
						} );
					}

					successCallback();
				} );
			}
		} );
	}

	getParamsForApi( cardDetails, cardToken, extraParams = {} ) {
		return {
			...extraParams,
			country: cardDetails.country,
			zip: cardDetails[ 'postal-code' ],
			month: cardDetails[ 'expiration-date' ].split( '/' )[ 0 ],
			year: cardDetails[ 'expiration-date' ].split( '/' )[ 1 ],
			name: cardDetails.name,
			document: cardDetails.document,
			street_number: cardDetails[ 'street-number' ],
			address_1: cardDetails[ 'address-1' ],
			address_2: cardDetails[ 'address-2' ],
			city: cardDetails.city,
			state: cardDetails.state,
			phone_number: cardDetails[ 'phone-number' ],
			cardToken,
		};
	}

	getValidationErrors() {
		const validationResult = validatePaymentDetails( this.getCardDetails() );

		// Maps keys from credit card validator to work with formState.
		return mapKeys( validationResult.errors, ( value, key ) => {
			return camelCase( key );
		} );
	}

	getCardDetails() {
		// Maps keys from formState to work with CreditCardFormFields component and credit card validator.
		return mapKeys( formState.getAllFieldValues( this.state.form ), ( value, key ) => {
			return kebabCase( key );
		} );
	}

	render() {
		const { translate, autoFocus, heading, onCancel } = this.props;
		return (
			<form onSubmit={ this.onSubmit } ref={ this.storeForm }>
				<Card className="credit-card-form__content">
					{ heading && <div className="credit-card-form__heading">{ heading }</div> }
					<QueryPaymentCountries />
					<CreditCardFormFields
						card={ this.getCardDetails() }
						countriesList={ this.props.countriesList }
						eventFormName="Edit Card Details Form"
						onFieldChange={ this.onFieldChange }
						getErrorMessage={ this.getErrorMessage }
						// "This prop can reduce usability and accessibility",
						// but it's already enabled by default and this just
						// provides a way to disable it, so...
						// eslint-disable-next-line jsx-a11y/no-autofocus
						autoFocus={ autoFocus }
					/>
					<div className="credit-card-form__card-terms">
						<GridiconInfoOutline size={ 18 } />
						<p>
							{ translate(
								'By saving a credit card, you agree to our {{tosLink}}Terms of Service{{/tosLink}}, and if ' +
									'you use it to pay for a subscription or plan, you authorize your credit card to be charged ' +
									'on a recurring basis until you cancel, which you can do at any time. ' +
									'You understand {{autoRenewalSupportPage}}how your subscription works{{/autoRenewalSupportPage}} ' +
									'and {{managePurchasesSupportPage}}how to cancel{{/managePurchasesSupportPage}}.',
								{
									components: {
										tosLink: (
											<a href="//wordpress.com/tos/" target="_blank" rel="noopener noreferrer" />
										),
										autoRenewalSupportPage: (
											<a href={ AUTO_RENEWAL } target="_blank" rel="noopener noreferrer" />
										),
										managePurchasesSupportPage: (
											<a href={ MANAGE_PURCHASES } target="_blank" rel="noopener noreferrer" />
										),
									},
								}
							) }
						</p>
					</div>
					{ this.renderUsedForExistingPurchases() }
				</Card>
				<CompactCard className="credit-card-form__footer">
					<em>{ translate( 'All fields required' ) }</em>
					{ onCancel && (
						<FormButton type="button" isPrimary={ false } onClick={ onCancel }>
							{ translate( 'Cancel' ) }
						</FormButton>
					) }
					<FormButton disabled={ this.state.formSubmitting } type="submit">
						{ this.state.formSubmitting
							? translate( 'Saving Card…', {
									context: 'Button label',
									comment: 'Credit card',
							  } )
							: translate( 'Save Card', {
									context: 'Button label',
									comment: 'Credit card',
							  } ) }
					</FormButton>
				</CompactCard>
			</form>
		);
	}

	renderUsedForExistingPurchases() {
		const { translate, showUsedForExistingPurchasesInfo } = this.props;

		if ( ! showUsedForExistingPurchasesInfo ) {
			return;
		}

		return (
			<div className="credit-card-form__card-terms">
				<GridiconInfoOutline size={ 18 } />
				<p>{ translate( 'This card will be used for future renewals of existing purchases.' ) }</p>
			</div>
		);
	}
}

export default connect( state => ( {
	countriesList: getCountries( state, 'payments' ),
} ) )( localize( CreditCardForm ) );
