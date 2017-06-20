/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Button from 'components/button';
import {
	cancelEditingPaymentMethod,
	changePaymentMethodEnabled,
	changePaymentMethodField,
	closeEditingPaymentMethod,
	openPaymentMethodForEdit,
} from 'woocommerce/state/ui/payments/methods/actions';
import { getCurrentlyEditingPaymentMethod } from 'woocommerce/state/ui/payments/methods/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { errorNotice, successNotice } from 'state/notices/actions';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import ListItem from 'woocommerce/components/list/list-item';
import ListItemField from 'woocommerce/components/list/list-item-field';
import PaymentMethodEdit from './payment-method-edit';
import PaymentMethodEditFormToggle from './payment-method-edit-form-toggle';
import PaymentMethodPaypal from './payment-method-paypal';
import PaymentMethodStripe from './payment-method-stripe';
import { savePaymentMethod, savePaymentMethodEnabled } from 'woocommerce/state/sites/payment-methods/actions';

class PaymentMethodItem extends Component {
	static propTypes = {
		cancelEditingPaymentMethod: PropTypes.func.isRequired,
		closeEditingPaymentMethod: PropTypes.func.isRequired,
		currentlyEditingId: PropTypes.string,
		currentlyEditingMethod: PropTypes.shape( {
			id: PropTypes.string,
		} ),
		method: PropTypes.shape( {
			title: PropTypes.string.isRequired,
			isSuggested: PropTypes.bool,
			fees: PropTypes.string,
			id: PropTypes.string,
			informationUrl: PropTypes.string,
		} ),
		openPaymentMethodForEdit: PropTypes.func.isRequired,
		savePaymentMethod: PropTypes.func.isRequired,
	};

	onEditHandler = () => {
		const { currentlyEditingMethod, method } = this.props;
		const currentlyEditingId = currentlyEditingMethod && currentlyEditingMethod.id;
		if ( currentlyEditingId === method.id ) {
			this.onCancel( method );
		} else {
			this.onEdit( method );
		}
	};

	onCancel = () => {
		this.props.cancelEditingPaymentMethod( this.props.site.ID, this.props.method.id );
	}

	onEdit = () => {
		this.props.openPaymentMethodForEdit( this.props.site.ID, this.props.method.id );
	}

	onEditField = ( field, value ) => {
		this.props.changePaymentMethodField( this.props.site.ID, field, value );
	}

	onChangeEnabled = ( e ) => {
		const { method, site, translate } = this.props;

		const enabled = 'yes' === e.target.value;
		this.props.changePaymentMethodEnabled(
			site.ID,
			method.id,
			enabled
		);

		if ( enabled ) {
			analytics.tracks.recordEvent( 'calypso_woocommerce_payment_method_enabled', {
				paymentMethod: method.id,
			} );
		} else {
			analytics.tracks.recordEvent( 'calypso_woocommerce_payment_method_disabled', {
				paymentMethod: method.id,
			} );
		}

		const successAction = () => {
			return successNotice(
				translate( 'Payment method successfully saved.' ),
				{ duration: 4000 }
			);
		};

		const errorAction = () => {
			this.props.changePaymentMethodEnabled(
				site.ID,
				method.id,
				! enabled
			);
			return errorNotice(
				translate( 'There was a problem saving the payment method. Please try again.' )
			);
		};
		this.props.savePaymentMethodEnabled(
			site.ID,
			method.id,
			e.target.value,
			successAction,
			errorAction
		);
	}

	onSave = () => {
		const { method, site, translate } = this.props;

		const successAction = () => {
			this.props.closeEditingPaymentMethod( site.ID, method.id );
			return successNotice(
				translate( 'Payment method successfully saved.' ),
				{ duration: 4000 }
			);
		};

		const errorAction = () => {
			return errorNotice(
				translate( 'There was a problem saving the payment method. Please try again.' )
			);
		};
		this.props.savePaymentMethod( site.ID, method, successAction, errorAction );
	}

	outputEditComponent = () => {
		const { currentlyEditingMethod, method } = this.props;
		if ( method.id === 'paypal' ) {
			return (
				<PaymentMethodPaypal
					method={ currentlyEditingMethod }
					onEditField={ this.onEditField }
					onSave={ this.onSave } />
			);
		}
		if ( method.id === 'stripe' ) {
			return (
				<PaymentMethodStripe
					method={ currentlyEditingMethod }
					onEditField={ this.onEditField }
					onSave={ this.onSave } />
			);
		}
		return (
			<PaymentMethodEdit
				method={ currentlyEditingMethod }
				onEditField={ this.onEditField }
				onSave={ this.onSave } />
		);
	}

	renderEnabledField = ( isEnabled ) => {
		return (
			<PaymentMethodEditFormToggle
				checked={ isEnabled }
				name="enabled"
				onChange={ this.onChangeEnabled } />
		);
	}

	render() {
		const currentlyEditingId = this.props.currentlyEditingMethod &&
			this.props.currentlyEditingMethod.id;
		const { method, translate } = this.props;
		let editButtonText = method.enabled ? translate( 'Manage' ) : translate( 'Set up' );
		if ( currentlyEditingId === method.id ) {
			editButtonText = translate( 'Cancel' );
		}

		return (
			<ListItem>
				<ListItemField className="payments__method-method-suggested-container">
					{
						method.isSuggested &&
						(
							<p className="payments__method-suggested">
								{ translate( 'Suggested Method' ) }
							</p>
						)
					}
					<p className="payments__method-name">{ method.title }</p>
				</ListItemField>
				<ListItemField className="payments__method-method-information-container">
					{ method.fees && (
						<p className="payments__method-information">{ method.fees }</p>
					) }
					{ method.informationUrl && (
						<p className="payments__method-information">
							<a href={ method.informationUrl }>
								{ translate( 'More Information' ) }
							</a>
						</p>
					) }

				</ListItemField>
				<ListItemField className="payments__method-enable-container">
					<FormFieldset className="payments__method-enable">
						<div>
							<FormLabel>{ translate( 'Enabled' ) }</FormLabel>
							{ this.renderEnabledField( method.enabled ) }
						</div>
					</FormFieldset>
				</ListItemField>
				<ListItemField className="payments__method-action-container">
					<Button compact onClick={ this.onEditHandler }>
						{ editButtonText }
					</Button>
				</ListItemField>
				{ currentlyEditingId === method.id && (
					this.outputEditComponent()
				) }
			</ListItem>
		);
	}
}

function mapStateToProps( state ) {
	const currentlyEditingMethod = getCurrentlyEditingPaymentMethod( state );
	const site = getSelectedSiteWithFallback( state );
	return {
		currentlyEditingMethod,
		site,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			cancelEditingPaymentMethod,
			changePaymentMethodEnabled,
			changePaymentMethodField,
			closeEditingPaymentMethod,
			openPaymentMethodForEdit,
			savePaymentMethod,
			savePaymentMethodEnabled,
		},
		dispatch
	);
}

export default localize(
	connect( mapStateToProps, mapDispatchToProps )( PaymentMethodItem )
);
