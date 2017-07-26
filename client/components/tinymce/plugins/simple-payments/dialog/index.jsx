/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import emailValidator from 'email-validator';

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
		isEdit: PropTypes.bool.isRequired,
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
			initialFields: this.constructor.initialFields,
			onNewState: form => this._isMounted && this.setState( { form } ),
			validatorFunction: this.validateFormFields,
		} );

		this.state = {
			activeTab: 'form',
			selectedPaymentId: null,
			form: this.formStateController.getInitialState(),
			isSubmitting: false,
			errorMessage: null,
			uploadedImageId: null,
		};
	}

	componentWillReceiveProps( nextProps ) {
		// When transitioning from hidden to visible, switch the tab to 'form'.
		if ( nextProps.showDialog && ! this.props.showDialog ) {
			this.setState( { activeTab: 'form' } );
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

	handleUploadedImage = uploadedImage => {
		this.handleFormFieldChange( 'featuredImageId', uploadedImage.ID );
	};

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
			const productForm = this.getFormValues();

			if ( currencyCode ) {
				productForm.currency = currencyCode;
			}

			productId = wpcom
				.site( siteId )
				.addPost( productToCustomPost( productForm ) )
				.then( newProduct => {
					dispatch( receiveUpdateProduct( siteId, customPostToProduct( newProduct ) ) );
					return newProduct.ID;
				} );
		}

		productId
			.then( id => this.props.onInsert( { id } ) )
			.catch( () => this.showError( translate( 'The payment button could not be inserted.' ) ) )
			.then( () => this.setIsSubmitting( false ) );
	};

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

		const insertDisabled =
			( activeTab === 'form' && formState.hasErrors( this.state.form ) ) ||
			( activeTab === 'list' && this.state.selectedPaymentId === null );

		return [
			<Button onClick={ onClose } disabled={ isSubmitting }>
				{ translate( 'Cancel' ) }
			</Button>,
			<Button
				onClick={ this.handleInsert }
				busy={ isSubmitting }
				disabled={ isSubmitting || insertDisabled }
				primary
			>
				{ translate( 'Insert' ) }
			</Button>,
		];
	}

	render() {
		const { showDialog, onClose, siteId, paymentButtons, currencyCode } = this.props;
		const { activeTab, errorMessage } = this.state;

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

				<Navigation
					activeTab={ activeTab }
					onChangeTabs={ this.handleChangeTabs }
					paymentButtons={ paymentButtons }
				/>
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
						/> }
			</Dialog>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		paymentButtons: getSimplePayments( state, siteId ) || [],
		currencyCode: getCurrentUserCurrencyCode( state ),
	};
} )( localize( SimplePaymentsDialog ) );
