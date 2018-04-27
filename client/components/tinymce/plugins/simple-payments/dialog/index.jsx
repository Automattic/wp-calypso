/** @format */
/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, isNumber, pick, noop, get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { isJetpackSite, isJetpackMinimumVersion } from 'state/sites/selectors';
import { getSimplePayments } from 'state/selectors';
import QuerySimplePayments from 'components/data/query-simple-payments';
import QuerySitePlans from 'components/data/query-site-plans';
import Dialog from 'components/dialog';
import Button from 'components/button';
import Notice from 'components/notice';
import Navigation from './navigation';
import ProductForm, { getProductFormValues, isProductFormValid, isProductFormDirty } from './form';
import ProductList from './list';
import { getCurrentUserCurrencyCode, getCurrentUserEmail } from 'state/current-user/selectors';
import wpcom from 'lib/wp';
import accept from 'lib/accept';
import {
	customPostToProduct,
	productToCustomPost,
} from 'state/data-layer/wpcom/sites/simple-payments/index.js';
import { membershipProductFromApi } from 'state/data-layer/wpcom/sites/memberships/index.js';
import {
	receiveUpdateProduct,
	receiveDeleteProduct,
} from 'state/simple-payments/product-list/actions';
import { PLAN_PREMIUM, FEATURE_SIMPLE_PAYMENTS } from 'lib/plans/constants';
import { hasFeature, getSitePlanSlug } from 'state/sites/plans/selectors';
import UpgradeNudge from 'my-sites/upgrade-nudge';
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';
import EmptyContent from 'components/empty-content';
import Banner from 'components/banner';
import config from 'config';

// Utility function for checking the state of the Payment Buttons list
const isEmptyArray = a => Array.isArray( a ) && a.length === 0;

// Selector to get the form values and convert them to a custom post data structure
// ready to be passed to `wpcom` API.
const productFormToCustomPost = state => productToCustomPost( getProductFormValues( state ) );

const createMembershipButton = siteId => ( dispatch, getState ) => {
	// This is a memberships submission.
	const values = get( getState(), [ 'form', 'simplePaymentsForm', 'values' ], {} );
	return wpcom.req
		.post( `/sites/${ siteId }/memberships/product`, {
			title: values.title,
			description: values.description,
			connected_destination_account_id: values.stripe_account,
			interval: values.renewal_schedule,
			price: values.price,
			currency: values.currency,
		} )
		.then( newProduct => {
			const product = membershipProductFromApi( newProduct.product );
			dispatch( receiveUpdateProduct( siteId, product ) );
			return product;
		} );
};

// Thunk action creator to create a new button
const createPaymentButton = siteId => ( dispatch, getState ) => {
	const productCustomPost = productFormToCustomPost( getState() );

	return wpcom
		.site( siteId )
		.addPost( productCustomPost )
		.then( newPost => {
			const newProduct = customPostToProduct( newPost );
			dispatch( receiveUpdateProduct( siteId, newProduct ) );
			return newProduct;
		} );
};

// Thunk action creator to update an existing button
const updatePaymentButton = ( siteId, paymentId ) => ( dispatch, getState ) => {
	const productCustomPost = productFormToCustomPost( getState() );

	return wpcom
		.site( siteId )
		.post( paymentId )
		.update( productCustomPost )
		.then( updatedPost => {
			const updatedProduct = customPostToProduct( updatedPost );
			dispatch( receiveUpdateProduct( siteId, updatedProduct ) );
			return updatedProduct;
		} );
};

const updateMembershipButton = ( siteId, productId ) => ( dispatch, getState ) => {
	// This is a memberships submission.
	const values = get( getState(), [ 'form', 'simplePaymentsForm', 'values' ], {} );
	return wpcom.req
		.post( `/sites/${ siteId }/memberships/product/${ productId }`, {
			title: values.title,
			description: values.description,
			connected_destination_account_id: values.stripe_account,
			interval: values.renewal_schedule,
			price: values.price,
			currency: values.currency,
		} )
		.then( newProduct => {
			const product = membershipProductFromApi( newProduct.product );
			dispatch( receiveUpdateProduct( siteId, product ) );
			return product;
		} );
};

// Thunk action creator to delete a button
const trashPaymentButton = ( siteId, paymentId ) => dispatch => {
	// TODO: Replace double-delete with single-delete call after server-side shortcode renderer
	// is updated to ignore payment button posts with `trash` status.
	const post = wpcom.site( siteId ).post( paymentId );
	return post
		.delete()
		.then( () => post.delete() )
		.then( () => dispatch( receiveDeleteProduct( siteId, paymentId ) ) );
};

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
		currency: 'USD',
		multiple: false,
		email: '',
		featuredImageId: null,
		recurring: false,
	};

	constructor( props ) {
		super( props );

		this._isMounted = false;

		const { editPaymentId, paymentButtons } = this.props;

		this.state = {
			activeTab: editPaymentId || isEmptyArray( paymentButtons ) ? 'form' : 'list',
			editedPaymentId: editPaymentId,
			initialFormValues: this.getInitialFormFields( editPaymentId ),
			selectedPaymentId: null,
			isSubmitting: false,
			errorMessage: null,
		};
	}

	componentWillReceiveProps( nextProps ) {
		// When transitioning from hidden to visible, show and initialize the form
		if ( nextProps.showDialog && ! this.props.showDialog ) {
			if ( nextProps.editPaymentId ) {
				// Explicitly ordered to edit a particular button
				this.showButtonForm( nextProps.editPaymentId );
			} else if ( isEmptyArray( nextProps.paymentButtons ) ) {
				// If the button list is loaded and empty, show the "Add New" form
				this.showButtonForm( null );
			} else {
				// If the list is loading or is non-empty, show it
				this.showButtonList();
			}
		}

		// If the list has finished loading and is empty, switch from list to the "Add New" form
		if ( this.props.paymentButtons === null && isEmptyArray( nextProps.paymentButtons ) ) {
			this.showButtonForm( null );
		}
	}

	componentDidMount() {
		this._isMounted = true;
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	// Get initial values for a form -- either from an existing payment when editing one,
	// or the default values for a new one.
	getInitialFormFields( paymentId ) {
		const { initialFields } = this.constructor;
		const { paymentButtons, currencyCode, currentUserEmail } = this.props;

		if ( isNumber( paymentId ) ) {
			const editedPayment = find( paymentButtons, p => p.ID === paymentId );
			if ( editedPayment ) {
				// Pick only the fields supported by the form -- drop the rest
				return pick( editedPayment, Object.keys( initialFields ) );
			}
		}

		const initialCurrency = currencyCode || 'USD';
		const initialEmail = get( paymentButtons, '0.email', currentUserEmail );

		return { ...initialFields, currency: initialCurrency, email: initialEmail };
	}

	isDirectEdit() {
		return isNumber( this.props.editPaymentId );
	}

	checkUnsavedForm() {
		const formIsUnsaved = this.state.activeTab === 'form' && this.props.formIsDirty;

		if ( ! formIsUnsaved ) {
			// No need to check anything, resolve to `accepted = true` right away.
			return Promise.resolve( true );
		}

		// ask for confirmation
		return new Promise( resolve => {
			const { translate } = this.props;
			accept(
				translate( 'Wait! You have unsaved changes. Do you really want to discard them?' ),
				resolve,
				translate( 'Discard' ),
				null,
				{
					isScary: true,
				}
			);
		} );
	}

	handleDialogClose = () => {
		// If there is a form that needs to be saved, ask for confirmation first.
		// If not confirmed, the transition will be cancelled -- dialog remains opened.
		this.checkUnsavedForm().then( accepted => accepted && this.props.onClose() );
	};

	handleChangeTabs = activeTab => {
		if ( activeTab === 'form' ) {
			this.showButtonForm( null );
		} else {
			// If there is a form that needs to be saved, ask for confirmation first.
			// If not confirmed, the transition will be cancelled -- tab is not switched.
			this.checkUnsavedForm().then( accepted => accepted && this.showButtonList() );
		}
	};

	showButtonList() {
		this.setState( { activeTab: 'list' } );
	}

	showButtonForm = editedPaymentId => {
		const initialFormValues = this.getInitialFormFields( editedPaymentId );
		this.setState( { activeTab: 'form', editedPaymentId, initialFormValues } );
	};

	handleSelectedChange = selectedPaymentId => this.setState( { selectedPaymentId } );

	setIsSubmitting( isSubmitting ) {
		this._isMounted && this.setState( { isSubmitting } );
	}

	showError = errorMessage => this._isMounted && this.setState( { errorMessage } );

	dismissError = () => this._isMounted && this.setState( { errorMessage: null } );

	handleInsert = () => {
		const { siteId, dispatch, translate } = this.props;
		const { activeTab } = this.state;

		this.setIsSubmitting( true );

		let productId;

		if ( activeTab === 'list' ) {
			productId = Promise.resolve( this.state.selectedPaymentId );
		} else if (
			config.isEnabled( 'memberships' ) &&
			this.props.currentlyEditedIsMembershipSubscription
		) {
			// This is memberships business.
			productId = dispatch( createMembershipButton( siteId ) ).then( newProduct => {
				dispatch(
					recordTracksEvent( 'calypso_memberships_button_create', {
						price: newProduct.price,
						currency: newProduct.currency,
						id: newProduct.ID,
					} )
				);
				return newProduct.ID;
			} );
		} else {
			productId = dispatch( createPaymentButton( siteId ) ).then( newProduct => {
				dispatch(
					recordTracksEvent( 'calypso_simple_payments_button_create', {
						price: newProduct.price,
						currency: newProduct.currency,
						id: newProduct.ID,
					} )
				);
				return newProduct.ID;
			} );
		}

		productId
			.then( id =>
				dispatch( ( d, getState ) => getSimplePayments( getState(), this.props.siteId, id ) )
			)
			.then( product => {
				this.props.onInsert( { id: product.ID, isMembership: !! product.recurring } );
				dispatch(
					recordTracksEvent( 'calypso_simple_payments_button_insert', { id: product.ID } )
				);
			} )
			.catch( () => this.showError( translate( 'The payment button could not be inserted.' ) ) )
			.then( () => this.setIsSubmitting( false ) );
	};

	handleSave = () => {
		this.setIsSubmitting( true );

		const { siteId, dispatch, translate } = this.props;
		const { editedPaymentId } = this.state;

		// On successful update, finish the edit (by going back to list or closing the dialog).
		// On save error, show error notice and keep the form displayed.
		let updateAction = null;
		if ( config.isEnabled( 'memberships' ) && this.props.currentlyEditedIsMembershipSubscription ) {
			updateAction = updateMembershipButton( siteId, editedPaymentId );
		} else {
			updateAction = updatePaymentButton( siteId, editedPaymentId );
		}
		dispatch( updateAction )
			.then( this.handleFormClose )
			.catch( () => this.showError( translate( 'The payment button could not be updated.' ) ) )
			.then( () => this.setIsSubmitting( false ) );
	};

	// After the form edit is finished (either sucessfully saved or cancelled), go back where
	// we came from: either back to the list, or close the modal.
	handleFormClose = () => {
		if ( this.isDirectEdit() ) {
			this.props.onClose();
		} else {
			this.showButtonList();
		}
	};

	handleTrash = paymentId => {
		const { translate } = this.props;
		const areYouSure = translate(
			'Are you sure you want to delete this item? It will be disabled and removed from all locations where it currently appears.'
		);
		accept(
			areYouSure,
			accepted => {
				if ( ! accepted ) {
					return;
				}

				this.setIsSubmitting( true );

				const { siteId, dispatch } = this.props;

				dispatch( recordTracksEvent( 'calypso_simple_payments_button_delete', { id: paymentId } ) );
				dispatch( trashPaymentButton( siteId, paymentId ) )
					.catch( () => this.showError( translate( 'The payment button could not be deleted.' ) ) )
					.then( () => this.setIsSubmitting( false ) );
			},
			translate( 'Delete' ),
			null,
			{
				isScary: true,
			}
		);
	};

	getActionButtons() {
		const { formIsValid, formIsDirty, translate } = this.props;
		const { activeTab, editedPaymentId, isSubmitting } = this.state;

		const formCanBeSubmitted = formIsValid && formIsDirty;

		let cancelHandler, finishHandler, finishDisabled, finishLabel;
		if ( activeTab === 'form' && isNumber( editedPaymentId ) ) {
			// When editing an existing payment, show:
			// - "Cancel" buttons that drops the changes and navigates back to where we came from
			// - "Done" button that saves the changes and navigates.
			cancelHandler = this.handleFormClose;
			finishHandler = this.handleSave;
			finishDisabled = ! formCanBeSubmitted;
			finishLabel = translate( 'Done' );
		} else {
			// Otherwise, when inserting, show:
			// - "Cancel" button that closes the dialog
			// - "Insert" button that inserts a shortcode and then closes the dialog
			cancelHandler = this.props.onClose;
			finishHandler = this.handleInsert;
			finishDisabled =
				( activeTab === 'form' && ! formCanBeSubmitted ) ||
				( activeTab === 'list' && this.state.selectedPaymentId === null );
			finishLabel = translate( 'Insert' );
		}

		return [
			<Button onClick={ cancelHandler } disabled={ isSubmitting }>
				{ translate( 'Cancel' ) }
			</Button>,
			<Button
				onClick={ finishHandler }
				busy={ isSubmitting }
				disabled={ isSubmitting || finishDisabled }
				primary
			>
				{ isSubmitting ? translate( 'Saving…' ) : finishLabel }
			</Button>,
		];
	}

	renderEmptyDialog( content, disableNavigation = false ) {
		const { onClose, translate, showDialog } = this.props;
		return (
			<Dialog
				isVisible={ showDialog }
				onClose={ onClose }
				buttons={ [ <Button onClick={ onClose }>{ translate( 'Close' ) }</Button> ] }
				additionalClassNames="editor-simple-payments-modal"
			>
				<TrackComponentView eventName="calypso_simple_payments_dialog_view" />
				{ ! disableNavigation && (
					<Navigation activeTab={ 'list' } paymentButtons={ [] } onChangeTabs={ noop } />
				) }
				{ content }
			</Dialog>
		);
	}

	returnTrue() {
		return true;
	}

	render() {
		const {
			showDialog,
			siteId,
			siteSlug,
			paymentButtons,
			currencyCode,
			isJetpackNotSupported,
			translate,
			planHasSimplePaymentsFeature,
			shouldQuerySitePlans,
		} = this.props;
		const { activeTab, initialFormValues, errorMessage } = this.state;

		// Don't show navigation on 'form' tab if the list is empty or if directly editing
		// a payment button. On the 'list' tab, always show it.
		const showNavigation =
			activeTab === 'list' ||
			( activeTab === 'form' && ! this.isDirectEdit() && ! isEmptyArray( paymentButtons ) );

		if ( ! shouldQuerySitePlans && isJetpackNotSupported ) {
			return this.renderEmptyDialog(
				<EmptyContent
					className="upgrade-jetpack"
					illustration="/calypso/images/illustrations/illustration-jetpack.svg"
					title={ translate( 'Upgrade Jetpack to use Simple Payments' ) }
					illustrationWidth={ 600 }
					action={
						<Banner
							icon="star"
							title={ translate( 'Upgrade your Jetpack!' ) }
							description={ translate( 'Simple Payments requires Jetpack version 5.2 or later.' ) }
							feature={ FEATURE_SIMPLE_PAYMENTS }
							plan={ PLAN_PREMIUM }
							href={ '../../plugins/jetpack/' + siteSlug }
						/>
					}
				/>,
				true
			);
		}

		if ( false && ! shouldQuerySitePlans && ! planHasSimplePaymentsFeature ) {
			return this.renderEmptyDialog(
				<EmptyContent
					illustration="/calypso/images/illustrations/type-e-commerce.svg"
					illustrationWidth={ 300 }
					title={ translate( 'Want to add a payment button to your site?' ) }
					action={
						<UpgradeNudge
							className="editor-simple-payments-modal__nudge-nudge"
							title={ translate( 'Upgrade your plan to our Premium or Business plan!' ) }
							message={ translate(
								'Get simple payments, advanced social media tools, your own domain, and more.'
							) }
							feature={ FEATURE_SIMPLE_PAYMENTS }
							event="editor_simple_payments_modal_nudge"
							shouldDisplay={ this.returnTrue }
						/>
					}
					secondaryAction={
						<a
							className="empty-content__action button"
							href="https://support.wordpress.com/simple-payments/"
						>
							{ translate( 'Learn more about Simple Payments' ) }
						</a>
					}
				/>,
				true
			);
		}

		return (
			<Dialog
				isVisible={ showDialog }
				onClose={ this.handleDialogClose }
				buttons={ this.getActionButtons() }
				additionalClassNames="editor-simple-payments-modal"
			>
				<TrackComponentView eventName="calypso_simple_payments_dialog_view" />
				<QuerySimplePayments siteId={ siteId } />

				{ ( ! currencyCode || shouldQuerySitePlans ) && <QuerySitePlans siteId={ siteId } /> }

				{ showNavigation && (
					<Navigation
						activeTab={ activeTab }
						paymentButtons={ paymentButtons }
						onChangeTabs={ this.handleChangeTabs }
					/>
				) }
				{ errorMessage && (
					<Notice status="is-error" text={ errorMessage } onDismissClick={ this.dismissError } />
				) }
				{ activeTab === 'form' ? (
					<ProductForm initialValues={ initialFormValues } showError={ this.showError } />
				) : (
					<ProductList
						siteId={ siteId }
						paymentButtons={ paymentButtons }
						selectedPaymentId={ this.state.selectedPaymentId }
						onSelectedChange={ this.handleSelectedChange }
						onTrashClick={ this.handleTrash }
						onEditClick={ this.showButtonForm }
					/>
				) }
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
		siteSlug: getSiteSlug( state, siteId ),
		paymentButtons: getSimplePayments( state, siteId ),
		currencyCode: getCurrentUserCurrencyCode( state ),
		shouldQuerySitePlans: getSitePlanSlug( state, siteId ) === null,
		currentlyEditedIsMembershipSubscription: get(
			state,
			[ 'form', 'simplePaymentsForm', 'values', 'recurring' ],
			false
		),
		isJetpackNotSupported:
			isJetpackSite( state, siteId ) && ! isJetpackMinimumVersion( state, siteId, '5.2' ),
		planHasSimplePaymentsFeature: hasFeature( state, siteId, FEATURE_SIMPLE_PAYMENTS ),
		formIsValid: isProductFormValid( state ),
		formIsDirty: isProductFormDirty( state ),
		currentUserEmail: getCurrentUserEmail( state ),
	};
} )( localize( SimplePaymentsDialog ) );
