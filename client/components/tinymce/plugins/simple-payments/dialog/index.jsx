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
import { addProduct, waitForResponse } from 'state/simple-payments/product-list/actions';
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

	handleInsert = async () => {
		this.setState( { isSubmitting: true } );

		try {
			const insertedProductId = await this.getInsertedProductId();
			if ( insertedProductId ) {
				this.props.onInsert( { id: insertedProductId } );
				// clear the form after a successful submit -- it'll be blank next time it's opened
				this.formStateController.resetFields( this.constructor.initialFields );
			}
		} catch ( error ) {
			if ( this._isMounted ) {
				this.setState( {
					errorMessage: this.props.translate( 'The payment button could not be inserted.' ),
				} );
			}
		}

		this._isMounted && this.setState( { isSubmitting: false } );
	};

	/*
	 * Asynchronously retrive the ID of the product to insert. In case of selection from
	 * list of existing product, we know the ID right away. When inserting from a filled
	 * form, we first need to issue a create request to the server, and wait for it to
	 * return an ID.
	 * @returns the ID, or null in case the form is not valid, or throws an exception in
	 * case of error that should be displayed as a notice.
	 */
	async getInsertedProductId() {
		const { activeTab, siteId, dispatch } = this.props;

		if ( activeTab === 'paymentButtons' ) {
			return this.state.selectedPaymentId;
		}

		if ( activeTab === 'addNew' ) {
			// ask the form controller to validate the field values
			const hasErrors = await new Promise( resolve =>
				this.formStateController.handleSubmit( resolve ),
			);

			if ( hasErrors ) {
				return null;
			}

			// ask the data layer to add a new product
			const formValues = this.getFormValues();
			const addProductAction = addProduct( siteId, formValues );
			dispatch( addProductAction );

			// wait for the response and return the assigned ID
			const addedProduct = await waitForResponse( addProductAction.requestId );
			return addedProduct.ID;
		}

		return null;
	}

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
