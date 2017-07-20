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
import { receiveUpdateProduct } from 'state/simple-payments/product-list/actions';
import MediaActions from 'lib/media/actions';

class SimplePaymentsDialog extends Component {
	static propTypes = {
		activeTab: PropTypes.oneOf( [ 'paymentButtons', 'addNew' ] ).isRequired,
		showDialog: PropTypes.bool.isRequired,
		isEdit: PropTypes.bool.isRequired,
		onChangeTabs: PropTypes.func.isRequired,
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
			selectedPaymentId: null,
			form: this.formStateController.getInitialState(),
			isSubmitting: false,
			errorMessage: null,
		};
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

	handleUploadImage = ( error, imageBlob, imageEditorProps ) => {
		const { siteId } = this.props;

		const { fileName, mimeType } = imageEditorProps;

		const item = {
			fileName: fileName,
			fileContents: imageBlob,
			mimeType: mimeType,
		};

		MediaActions.add( siteId, item );
	};

	handleUploadImageError = ( errorConstant, errorMessage ) => {
		this.setState( {
			errorMessage,
		} );
	};

	handleSelectedChange = selectedPaymentId => {
		this.setState( { selectedPaymentId } );
	};

	handleClose = () => {
		// clear the form after a successful submit -- it'll be blank next time it's opened
		this.formStateController.resetFields( this.constructor.initialFields );
		this.props.onClose();
	};

	dismissError = () => {
		this.setState( { errorMessage: null } );
	};

	handleInsert = () => {
		const { siteId, dispatch, currencyCode, activeTab } = this.props;

		this.setState( { isSubmitting: true } );

		if ( activeTab === 'paymentButtons' ) {
			const productId = this.state.selectedPaymentId;

			this.props.onInsert( { id: productId } );

			// clear the form after a successful submit -- it'll be blank next time it's opened
			this.formStateController.resetFields( this.constructor.initialFields );

			this._isMounted && this.setState( { isSubmitting: false } );

			return;
		}

		const productForm = this.getFormValues();

		if ( currencyCode ) {
			productForm.currency = currencyCode;
		}

		wpcom
			.site( siteId )
			.addPost( productToCustomPost( productForm ) )
			.then( newProduct => {
				dispatch( receiveUpdateProduct( siteId, customPostToProduct( newProduct ) ) );

				const productId = newProduct.ID;

				this.props.onInsert( { id: productId } );

				this.formStateController.resetFields( this.constructor.initialFields );

				this._isMounted && this.setState( { isSubmitting: false } );
			} )
			.catch( () => {
				if ( this._isMounted ) {
					this.setState( {
						errorMessage: this.props.translate( 'The payment button could not be inserted.' ),
					} );
					this.setState( { isSubmitting: false } );
				}
			} );
	};

	getActionButtons() {
		const { activeTab, translate } = this.props;
		const { isSubmitting } = this.state;

		const insertDisabled =
			( activeTab === 'addNew' && formState.hasErrors( this.state.form ) ) ||
			( activeTab === 'paymentButtons' && this.state.selectedPaymentId === null );

		return [
			<Button onClick={ this.handleClose } disabled={ isSubmitting }>
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
		const {
			activeTab,
			showDialog,
			onChangeTabs,
			onClose,
			siteId,
			paymentButtons,
			currencyCode,
		} = this.props;
		const { errorMessage } = this.state;

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

				<Navigation { ...{ activeTab, onChangeTabs, paymentButtons } } />
				{ errorMessage &&
					<Notice status="is-error" text={ errorMessage } onDismissClick={ this.dismissError } /> }
				{ activeTab === 'addNew'
					? <ProductForm
							currencyDefaults={ currencyDefaults }
							fieldValues={ this.getFormValues() }
							isFieldInvalid={ this.isFormFieldInvalid }
							onFieldChange={ this.handleFormFieldChange }
							onImageEditorDone={ this.handleUploadImage }
							onUploadImageError={ this.handleUploadImageError }
						/>
					: <ProductList
							paymentButtons={ paymentButtons }
							selectedPaymentId={ this.state.selectedPaymentId }
							onSelectedChange={ this.handleSelectedChange }
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
