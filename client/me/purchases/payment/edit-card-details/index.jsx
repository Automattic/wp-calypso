/**
 * External Dependencies
 */
import extend from 'lodash/object/assign';
import page from 'page';
import React from 'react';

/**
 * Internal Dependencies
 */
import analytics from 'analytics';
import camelCase from 'lodash/string/camelCase';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import { createPaygateToken } from 'lib/store-transactions';
import CreditCardForm from 'components/upgrades/credit-card-form';
import FormButton from 'components/forms/form-button';
import formState from 'lib/form-state';
import forOwn from 'lodash/object/forOwn';
import HeaderCake from 'components/header-cake' ;
import kebabCase from 'lodash/string/kebabCase';
import Main from 'components/main';
import mapKeys from 'lodash/object/mapKeys';
import notices from 'notices';
import paths from 'me/purchases/paths';
import titles from 'me/purchases/titles';
import { validateCardDetails } from 'lib/credit-card-details';
import ValidationErrorList from 'notices/validation-error-list';
import wpcomFactory from 'lib/wp';
import { getPurchase, goToManagePurchase, isDataLoading, recordPageView } from 'me/purchases/utils';

const wpcom = wpcomFactory.undocumented();

const EditCardDetails = React.createClass( {
	propTypes: {
		card: React.PropTypes.object.isRequired,
		countriesList: React.PropTypes.object.isRequired,
		selectedPurchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return {
			form: null,
			notice: null
		};
	},

	fieldNames: [
		'name',
		'number',
		'cvv',
		'expirationDate',
		'country',
		'postalCode'
	],

	/**
	 * Merges the specified card object returned by the StoredCards store into a new object with only properties that
	 * should be used to prefill the credit card form, and with keys matching the corresponding field names.
	 *
	 * @param card
	 * @param fields
	 */
	mergeCard( card, fields: {} ) {
		return extend( {}, fields, {
			name: card.name
		} );
	},

	componentWillMount() {
		recordPageView( 'edit_card_details', this.props );

		const fields = this.mergeCard( this.props.card, formState.createNullFieldValues( this.fieldNames ) );

		this.formStateController = formState.Controller( {
			initialFields: fields,
			onNewState: this.setFormState,
			validatorFunction: this.validate
		} );

		this.setState( { form: this.formStateController.getInitialState() } );
	},

	validate( formValues, onComplete ) {
		onComplete( null, this.getValidationErrors() );
	},

	setFormState( form ) {
		if ( ! this.isMounted() ) {
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

		this.formStateController.handleSubmit( ( hasErrors ) => {
			if ( hasErrors ) {
				return;
			}

			this.updateCreditCard();
		} );
	},

	updateCreditCard() {
		const cardDetails = this.getCardDetails();

		analytics.tracks.recordEvent(
			'calypso_purchases_credit_card_form_submit',
			{ product_slug: getPurchase( this.props ).productSlug }
		);

		createPaygateToken( 'card_update', cardDetails, ( paygateError, token ) => {
			if ( paygateError ) {
				notices.error( paygateError.message );
				return;
			}

			wpcom.updateCreditCard( this.getParamsForApi( token ), ( apiError, response ) => {
				if ( apiError ) {
					notices.error( apiError.message );
					return;
				}

				if ( response.error ) {
					notices.error( response.error );
					return;
				}

				notices.success( response.success, {
					persistent: true
				} );

				const { id } = getPurchase( this.props );

				page( paths.managePurchase( this.props.selectedSite.slug, id ) );
			} );
		} );
	},

	getParamsForApi( token ) {
		const cardDetails = this.getCardDetails();

		return {
			country: cardDetails.country,
			zip: cardDetails[ 'postal-code' ],
			month: cardDetails[ 'expiration-date' ].split( '/' )[ 0 ],
			year: cardDetails[ 'expiration-date' ].split( '/' )[ 1 ],
			name: cardDetails.name,
			paygateToken: token,
			purchaseId: this.props.selectedPurchase.data.id
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
		if ( isDataLoading( this.props ) ) {
			return (
				<Main className="edit-card-details">
					{ this.translate( 'Loading…' ) }
				</Main>
			);
		}

		return (
			<Main className="edit-card-details">
				<HeaderCake onClick={ goToManagePurchase.bind( null, this.props ) }>
					{ titles.editCardDetails }
				</HeaderCake>

				<form onSubmit={ this.onSubmit }>
					<Card className="edit-card-details__content">
						<CreditCardForm
							card={ this.getCardDetails() }
							countriesList={ this.props.countriesList }
							eventFormName="Edit Card Details Form"
							isFieldInvalid={ this.isFieldInvalid }
							onFieldChange={ this.onFieldChange } />
					</Card>

					<CompactCard className="edit-card-details__footer">
						<em>{ this.translate( 'All fields required' ) }</em>

						<FormButton type="submit">
							{ this.translate( 'Update Card', { context: 'Button label', comment: 'Credit card' } ) }
						</FormButton>
					</CompactCard>
				</form>
			</Main>
		);
	}
} );

export default EditCardDetails;
