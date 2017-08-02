/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import emailValidator from 'email-validator';
import { find, isNumber, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSimplePayments } from 'state/selectors';
import QuerySimplePayments from 'components/data/query-simple-payments';
import QuerySitePlans from 'components/data/query-site-plans';
import Dialog from 'components/dialog';
import Button from 'components/button';
import Notice from 'components/notice';
import Navigation from './navigation';
import ProductForm from './form';
import ProductList from './list';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getCurrencyDefaults } from 'lib/format-currency';
import formState from 'lib/form-state';
import wpcom from 'lib/wp';
import {
	customPostToProduct,
	productToCustomPost,
} from 'state/data-layer/wpcom/sites/simple-payments/index.js';
import {
	receiveUpdateProduct,
	receiveDeleteProduct,
} from 'state/simple-payments/product-list/actions';

class SimplePaymentsDialog extends Component {
	static propTypes = {
		showDialog: PropTypes.bool.isRequired,
		// If not null and is a valid payment button ID, start editing the button.
		// Otherwise, show the existing button list or the "Add New" form.
		editPaymentId: PropTypes.number,
		onClose: PropTypes.func.isRequired,
		onInsert: PropTypes.func.isRequired,
	};

	static initialFields = {
		title: '',
		description: '',
		price: '',
		multiple: false,
		email: '',
		currency: 'USD',
		featuredImageId: null,
	};

	constructor( props ) {
		super( props );

		this._isMounted = false;

		this.formStateController = formState.Controller( {
			initialFields: this.getInitialFormFields( this.props.editPaymentId ),
			onNewState: form => this._isMounted && this.setState( { form } ),
			validatorFunction: this.validateFormFields,
		} );

		this.state = {
			activeTab: this.defaultActiveTab(),
			editedPaymentId: this.props.editPaymentId,
			selectedPaymentId: null,
			form: this.formStateController.getInitialState(),
			isSubmitting: false,
			errorMessage: null,
			uploadedImageId: null,
		};
	}

	componentWillReceiveProps( nextProps ) {
		// When transitioning from hidden to visible, show and initialize the form
		if ( nextProps.showDialog && ! this.props.showDialog ) {
			this.editPaymentButton( nextProps.editPaymentId );
		}

		// clear the form when dialog is being closed -- it'll be blank next time it's opened
		if ( ! nextProps.showDialog && this.props.showDialog ) {
			this.formStateController.resetFields( this.constructor.initialFields );
		}
	}

	componentDidMount() {
		this._isMounted = true;
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	defaultActiveTab() {
		const { paymentButtons } = this.props;
		const hasPaymentButtons = paymentButtons && paymentButtons.length > 0;
		return hasPaymentButtons ? 'list' : 'form';
	}

	handleFormFieldChange = ( name, value ) => {
		this.formStateController.handleFieldChange( { name, value } );
	};

	isFormFieldInvalid = name => formState.isFieldInvalid( this.state.form, name );

	// Get initial values for a form -- either from an existing payment when editing one,
	// or the default values for a new one.
	getInitialFormFields( paymentId ) {
		const { initialFields } = this.constructor;

		if ( isNumber( paymentId ) ) {
			const editedPayment = find( this.props.paymentButtons, p => p.ID === paymentId );
			if ( editedPayment ) {
				// Pick only the fields supported by the form -- drop the rest
				return pick( editedPayment, Object.keys( initialFields ) );
			}
		}

		return initialFields;
	}

	getFormValues() {
		return formState.getAllFieldValues( this.state.form );
	}

	validateFormFields( formValues, onComplete ) {
		const formErrors = {};

		if ( ! formValues.title ) {
			formErrors.title = [ 'empty' ];
		}

		if ( ! formValues.price ) {
			formErrors.price = [ 'empty' ];
		}

		if ( ! formValues.email ) {
			formErrors.email = [ 'empty' ];
		} else if ( ! emailValidator.validate( formValues.email ) ) {
			formErrors.email = [ 'invalid' ];
		}

		onComplete( null, formErrors );
	}

	isDirectEdit() {
		return isNumber( this.props.editPaymentId );
	}

	handleUploadedImage = uploadedImage => {
		this.handleFormFieldChange( 'featuredImageId', uploadedImage.ID );
	};

	handleFormSubmit() {
		// will validate the form and return a promise of a `hasErrors` bool value
		return new Promise( resolve => this.formStateController.handleSubmit( resolve ) );
	}

	handleChangeTabs = activeTab => this.setState( { activeTab } );

	handleSelectedChange = selectedPaymentId => this.setState( { selectedPaymentId } );

	setIsSubmitting( isSubmitting ) {
		this._isMounted && this.setState( { isSubmitting } );
	}

	showError = errorMessage => this._isMounted && this.setState( { errorMessage } );

	dismissError = () => this._isMounted && this.setState( { errorMessage: null } );

	handleInsert = () => {
		const { siteId, dispatch, currencyCode, translate } = this.props;
		const { activeTab } = this.state;

		this.setIsSubmitting( true );

		let productId;

		if ( activeTab === 'list' ) {
			productId = Promise.resolve( this.state.selectedPaymentId );
		} else {
			productId = this.handleFormSubmit().then( hasErrors => {
				if ( hasErrors ) {
					return null;
				}

				const productForm = this.getFormValues();

				if ( currencyCode ) {
					productForm.currency = currencyCode;
				}

				return wpcom
					.site( siteId )
					.addPost( productToCustomPost( productForm ) )
					.then( newProduct => {
						dispatch( receiveUpdateProduct( siteId, customPostToProduct( newProduct ) ) );
						return newProduct.ID;
					} );
			} );
		}

		productId
			.then( id => id !== null && this.props.onInsert( { id } ) )
			.catch( () => this.showError( translate( 'The payment button could not be inserted.' ) ) )
			.then( () => this.setIsSubmitting( false ) );
	};

	handleSave = () => {
		// On successful update, either go back to list or close the dialog.
		// On validation or save error, keep the form displayed, i.e., do nothing here.
		this.handleFormSubmit().then( hasErrors => {
			if ( hasErrors ) {
				return;
			}

			this.updatePaymentButton().then( () => {
				if ( this.isDirectEdit() ) {
					// after changes are saved, close the dialog...
					this.props.onClose();
				} else {
					// ...or return to the list
					this.setState( { activeTab: 'list' } );
				}
			} );
		} );
	};

	editPaymentButton = paymentId => {
		this.setState( { activeTab: paymentId ? 'form' : this.defaultActiveTab(), editedPaymentId: paymentId } );
		this.formStateController.resetFields( this.getInitialFormFields( paymentId ) );
	};

	updatePaymentButton() {
		this.setIsSubmitting( true );

		const { siteId, dispatch, translate } = this.props;
		const { editedPaymentId } = this.state;
		const productForm = this.getFormValues();

		const update = wpcom
			.site( siteId )
			.post( editedPaymentId )
			.update( productToCustomPost( productForm ) );

		update
			.then( updatedProduct => {
				dispatch( receiveUpdateProduct( siteId, customPostToProduct( updatedProduct ) ) );
			} )
			.catch( () => this.showError( translate( 'The payment button could not be updated.' ) ) )
			.then( () => this.setIsSubmitting( false ) );

		return update;
	}

	trashPaymentButton = paymentId => {
		this.setIsSubmitting( true );

		const { siteId, dispatch, translate } = this.props;

		wpcom
			.site( siteId )
			.post( paymentId )
			.delete()
			.then( () => dispatch( receiveDeleteProduct( siteId, paymentId ) ) )
			.catch( () => this.showError( translate( 'The payment button could not be deleted.' ) ) )
			.then( () => this.setIsSubmitting( false ) );
	};

	getActionButtons() {
		const { onClose, translate } = this.props;
		const { activeTab, isSubmitting } = this.state;

		const buttons = [
			<Button onClick={ onClose } disabled={ isSubmitting }>
				{ translate( 'Cancel' ) }
			</Button>,
		];

		// When editing an existing payment, show "Save" button. Otherwise, show "Insert"
		const showSave = activeTab === 'form' && isNumber( this.state.editedPaymentId );
		if ( showSave ) {
			const saveDisabled = formState.hasErrors( this.state.form );

			buttons.push(
				<Button
					onClick={ this.handleSave }
					busy={ isSubmitting }
					disabled={ isSubmitting || saveDisabled }
					primary
				>
					{ translate( 'Save' ) }
				</Button>,
			);
		} else {
			const insertDisabled =
				( activeTab === 'form' && formState.hasErrors( this.state.form ) ) ||
				( activeTab === 'list' && this.state.selectedPaymentId === null );

			buttons.push(
				<Button
					onClick={ this.handleInsert }
					busy={ isSubmitting }
					disabled={ isSubmitting || insertDisabled }
					primary
				>
					{ translate( 'Insert' ) }
				</Button>,
			);
		}

		return buttons;
	}

	render() {
		const { showDialog, onClose, siteId, paymentButtons, currencyCode } = this.props;
		const { activeTab, errorMessage } = this.state;

		// Don't show navigation when directly editing a payment button
		const showNavigation = activeTab === 'list' || ! this.isDirectEdit();
		const currencyDefaults = getCurrencyDefaults( currencyCode );

		return (
			<Dialog
				isVisible={ showDialog }
				onClose={ onClose }
				buttons={ this.getActionButtons() }
				additionalClassNames="editor-simple-payments-modal"
			>
				<QuerySimplePayments siteId={ siteId } />

				{ ! currencyCode && <QuerySitePlans siteId={ siteId } /> }

				{ showNavigation &&
					<Navigation
						activeTab={ activeTab }
						paymentButtons={ paymentButtons }
						onChangeTabs={ this.handleChangeTabs }
					/> }
				{ errorMessage &&
					<Notice status="is-error" text={ errorMessage } onDismissClick={ this.dismissError } /> }
				{ activeTab === 'form'
					? <ProductForm
							currencyDefaults={ currencyDefaults }
							fieldValues={ this.getFormValues() }
							isFieldInvalid={ this.isFormFieldInvalid }
							onFieldChange={ this.handleFormFieldChange }
							onUploadImageDone={ this.handleUploadedImage }
							showError={ this.showError }
						/>
					: <ProductList
							paymentButtons={ paymentButtons }
							selectedPaymentId={ this.state.selectedPaymentId }
							onSelectedChange={ this.handleSelectedChange }
							onTrashClick={ this.trashPaymentButton }
							onEditClick={ this.editPaymentButton }
						/> }
			</Dialog>
		);
	}
}

export default connect( ( state, { siteId } ) => {
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	return {
		siteId,
		paymentButtons: getSimplePayments( state, siteId ) || [],
		currencyCode: getCurrentUserCurrencyCode( state ),
	};
} )( localize( SimplePaymentsDialog ) );
