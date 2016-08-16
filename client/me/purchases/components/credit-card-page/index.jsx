/**
 * External Dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import camelCase from 'lodash/camelCase';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import { createPaygateToken } from 'lib/store-transactions';
import CreditCardForm from 'components/upgrades/credit-card-form';
import CountriesList from 'lib/countries-list';
import CreditCardPageLoadingPlaceholder from './loading-placeholder';
import FormButton from 'components/forms/form-button';
import formState from 'lib/form-state';
import forOwn from 'lodash/forOwn';
import HeaderCake from 'components/header-cake' ;
import { getPurchase, goToManagePurchase, isDataLoading, recordPageView } from 'me/purchases/utils';
import kebabCase from 'lodash/kebabCase';
import Main from 'components/main';
import mapKeys from 'lodash/mapKeys';
import notices from 'notices';
import paths from 'me/purchases/paths';
import QueryStoredCards from 'components/data/query-stored-cards';
import QueryUserPurchases from 'components/data/query-user-purchases';
import userFactory from 'lib/user';
import { validateCardDetails } from 'lib/credit-card-details';
import ValidationErrorList from 'notices/validation-error-list';
import wpcomFactory from 'lib/wp';
import Gridicon from 'components/gridicon';
import support from 'lib/url/support';

const countriesList = CountriesList.forPayments();
const user = userFactory();
const wpcom = wpcomFactory.undocumented();

const CreditCardPage = React.createClass( {
	propTypes: {
		card: React.PropTypes.object,
		clearPurchases: React.PropTypes.func.isRequired,
		hasLoadedSites: React.PropTypes.bool.isRequired,
		hasLoadedStoredCardsFromServer: React.PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: React.PropTypes.bool.isRequired,
		selectedPurchase: React.PropTypes.object,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ),
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
		this.redirectIfDataIsInvalid();

		recordPageView( 'edit_card_details', this.props );

		const fields = formState.createNullFieldValues( this.fieldNames );

		if ( this.props.card ) {
			fields.name = this.props.card.name;
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

	componentWillReceiveProps( nextProps ) {
		this.redirectIfDataIsInvalid( nextProps );

		recordPageView( 'edit_card_details', this.props, nextProps );

		if ( ! this.props.hasLoadedStoredCardsFromServer && nextProps.hasLoadedStoredCardsFromServer && nextProps.card ) {
			this.formStateController.handleFieldChange( {
				name: 'name',
				value: nextProps.card.name
			} );
		}
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
				this.setState( { formSubmitting: false } );
				notices.error( paygateError.message );
				return;
			}

			wpcom.updateCreditCard( this.getParamsForApi( token ), ( apiError, response ) => {
				if ( apiError ) {
					this.setState( { formSubmitting: false } );
					notices.error( apiError.message );
					return;
				}

				if ( response.error ) {
					this.setState( { formSubmitting: false } );
					notices.error( response.error );
					return;
				}

				notices.success( response.success, {
					persistent: true
				} );

				const { id } = getPurchase( this.props );

				this.props.clearPurchases();

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
			purchaseId: getPurchase( this.props ).id
		};
	},

	redirectIfDataIsInvalid( props = this.props ) {
		if ( ! this.isDataValid( props ) ) {
			page( paths.list() );
		}
	},

	isDataValid( props = this.props ) {
		if ( isDataLoading( props ) ) {
			return true;
		}

		const purchase = getPurchase( props ),
			{ selectedSite } = props;

		return purchase && selectedSite;
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

	goToManagePurchase() {
		goToManagePurchase( this.props );
	},

	render() {
		if ( isDataLoading( this.props ) || ! this.props.hasLoadedStoredCardsFromServer ) {
			return (
				<Main className="credit-card-page">
					<QueryStoredCards />

					<QueryUserPurchases userId={ user.get().ID } />

					<CreditCardPageLoadingPlaceholder />
				</Main>
			);
		}

		return (
			<Main className="credit-card-page">
				<HeaderCake onClick={ this.goToManagePurchase }>{ this.props.title }</HeaderCake>

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
