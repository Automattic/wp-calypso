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
import { isJetpackSite, isJetpackMinimumVersion } from 'state/sites/selectors';
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

// Utility function for checking the state of the Payment Buttons list
const isEmptyArray = a => Array.isArray( a ) && a.length === 0;

class SimplePaymentsDialog extends Component {
	static propTypes = {
		showDialog: PropTypes.bool.isRequired,
		// If not null and is a valid payment button ID, start editing the button.
		// Otherwise, show the existing button list or the "Add New" form.
		editPaymentId: PropTypes.number,
		onClose: PropTypes.func.isRequired,
		onInsert: PropTypes.func.isRequired,
		isJetpackNotSupported: PropTypes.bool,
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

		const { editPaymentId, paymentButtons } = this.props;

		this.formStateController = formState.Controller( {
			initialFields: this.getInitialFormFields( editPaymentId ),
			onNewState: form => this._isMounted && this.setState( { form } ),
			validatorFunction: this.validateFormFields,
		} );

		this.state = {
			activeTab: editPaymentId || isEmptyArray( paymentButtons ) ? 'form' : 'list',
			editedPaymentId: editPaymentId,
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
			if ( nextProps.editPaymentId ) {
				// Explicitly ordered to edit a particular button
				this.editPaymentButton( nextProps.editPaymentId );
			} else if ( isEmptyArray( nextProps.paymentButtons ) ) {
				// If the button list is loaded and empty, show the "Add New" form
				this.editPaymentButton( null );
			} else {
				// If the list is loading or is non-empty, show it
				this.setState( { activeTab: 'list' } );
			}
		}

		// If the list has finished loading and is empty, switch from list to the "Add New" form
		if ( this.props.paymentButtons === null && isEmptyArray( nextProps.paymentButtons ) ) {
			this.editPaymentButton( null );
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
		this.setState( { activeTab: 'form', editedPaymentId: paymentId } );
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
		const { showDialog, onClose, siteId, paymentButtons, currencyCode, isJetpackNotSupported, translate } = this.props;
		const { activeTab, errorMessage } = this.state;

		// Don't show navigation on 'form' tab if the list is empty or if directly editing
		// a payment button. On the 'list' tab, always show it.
		const showNavigation =
			activeTab === 'list' ||
			( activeTab === 'form' && ! this.isDirectEdit() && ! isEmptyArray( paymentButtons ) );

		if ( isJetpackNotSupported ) {
			return (
				<Dialog
					isVisible={ showDialog }
					onClose={ onClose }
					buttons={ [
						<Button onClick={ onClose }>
							{ translate( 'Cancel' ) }
						</Button>,
					] }
					additionalClassNames="editor-simple-payments-modal"
				>
					<Notice status="is-error" text={
						translate( 'Please upgrade to Jetpack 5.2 to use Simple Payments feature' )
					} onDismissClick={ onClose } />
				</Dialog>
			);
		}
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
							currencyDefaults={ getCurrencyDefaults( currencyCode ) }
							fieldValues={ this.getFormValues() }
							isFieldInvalid={ this.isFormFieldInvalid }
							onFieldChange={ this.handleFormFieldChange }
							onUploadImageDone={ this.handleUploadedImage }
							showError={ this.showError }
						/>
					: <ProductList
							siteId={ siteId }
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
		paymentButtons: getSimplePayments( state, siteId ),
		currencyCode: getCurrentUserCurrencyCode( state ),
		isJetpackNotSupported: isJetpackSite( state, siteId ) && ! isJetpackMinimumVersion( state, siteId, '5.2' )
	};
} )( localize( SimplePaymentsDialog ) );
