/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import {
	cancelEditingPaymentMethod,
	changePaymentMethodEnabled,
	changePaymentMethodField,
	closeEditingPaymentMethod,
	openPaymentMethodForEdit,
} from 'woocommerce/state/ui/payments/methods/actions';
import { getCurrentlyEditingPaymentMethod } from 'woocommerce/state/ui/payments/methods/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import ExternalLink from 'components/external-link';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import { hasStripeKeyPairForMode } from './stripe/payment-method-stripe-utils';
import ListItem from 'woocommerce/components/list/list-item';
import ListItemField from 'woocommerce/components/list/list-item-field';
import PaymentMethodBACS from './payment-method-bacs';
import PaymentMethodEditDialog from './payment-method-edit-dialog';
import PaymentMethodEditFormToggle from './payment-method-edit-form-toggle';
import PaymentMethodPaypal from './payment-method-paypal';
import PaymentMethodStripe from './payment-method-stripe';
import PaymentMethodCheque from './payment-method-cheque';
import { recordTrack } from 'woocommerce/lib/analytics';

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
		onChange: PropTypes.func.isRequired,
		openPaymentMethodForEdit: PropTypes.func.isRequired,
		site: PropTypes.shape( {
			title: PropTypes.string,
		} ),
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
	};

	onEdit = () => {
		this.props.openPaymentMethodForEdit( this.props.site.ID, this.props.method.id );
	};

	onEditField = ( field, value ) => {
		this.props.onChange();
		this.props.changePaymentMethodField( this.props.site.ID, field, value );
	};

	onChangeEnabled = ( e ) => {
		const { method, site } = this.props;

		this.props.onChange();

		const enabled = 'yes' === e.target.value;
		this.props.changePaymentMethodEnabled( site.ID, method.id, enabled );

		if ( enabled ) {
			recordTrack( 'calypso_woocommerce_payment_method_enabled', {
				payment_method: method.id,
			} );
		} else {
			recordTrack( 'calypso_woocommerce_payment_method_disabled', {
				payment_method: method.id,
			} );
		}
	};

	onDone = () => {
		const { method, site } = this.props;
		this.props.closeEditingPaymentMethod( site.ID, method.id );
	};

	onDoneAndEnable = () => {
		const { method, site } = this.props;
		this.props.closeEditingPaymentMethod( site.ID, method.id );
		if ( ! method.enabled ) {
			this.props.onChange();
			this.props.changePaymentMethodEnabled( site.ID, method.id, true );
			recordTrack( 'calypso_woocommerce_payment_method_enabled', {
				payment_method: method.id,
			} );
		}
	};

	outputEditComponent = () => {
		const { currentlyEditingMethod, method, site } = this.props;
		if ( method.id === 'paypal' ) {
			return (
				<PaymentMethodPaypal
					method={ currentlyEditingMethod }
					onCancel={ this.onCancel }
					onEditField={ this.onEditField }
					onDone={ this.onDone }
				/>
			);
		}
		if ( method.id === 'stripe' ) {
			return (
				<PaymentMethodStripe
					method={ currentlyEditingMethod }
					onCancel={ this.onCancel }
					onEditField={ this.onEditField }
					onDone={ this.onDoneAndEnable }
					site={ site }
				/>
			);
		}
		if ( method.id === 'cheque' ) {
			return (
				<PaymentMethodCheque
					method={ currentlyEditingMethod }
					onCancel={ this.onCancel }
					onEditField={ this.onEditField }
					onDone={ this.onDone }
				/>
			);
		}

		if ( method.id === 'bacs' ) {
			return (
				<PaymentMethodBACS
					method={ currentlyEditingMethod }
					onCancel={ this.onCancel }
					onEditField={ this.onEditField }
					onDone={ this.onDone }
				/>
			);
		}

		return (
			<PaymentMethodEditDialog
				method={ currentlyEditingMethod }
				onCancel={ this.onCancel }
				onEditField={ this.onEditField }
				onDone={ this.onDone }
			/>
		);
	};

	renderEnabledField = ( method ) => {
		const { translate } = this.props;
		let showEnableField = true;
		if ( method.id === 'stripe' ) {
			showEnableField = hasStripeKeyPairForMode( method );
		}

		return (
			showEnableField && (
				<div>
					<FormLabel>{ translate( 'Enabled' ) }</FormLabel>
					<PaymentMethodEditFormToggle
						checked={ method.enabled }
						name="enabled"
						onChange={ this.onChangeEnabled }
					/>
				</div>
			)
		);
	};

	render() {
		const currentlyEditingId =
			this.props.currentlyEditingMethod && this.props.currentlyEditingMethod.id;
		const { method, translate } = this.props;
		let editButtonText = method.enabled ? translate( 'Manage' ) : translate( 'Set up' );
		if ( method.id === 'stripe' && hasStripeKeyPairForMode( method ) ) {
			editButtonText = translate( 'Manage' );
		}
		if ( currentlyEditingId === method.id ) {
			editButtonText = translate( 'Cancel' );
		}
		const methodTitle = 'payments__method-name payments__method-name-' + method.id;

		return (
			<ListItem>
				<ListItemField className="payments__method-method-suggested-container">
					{ method.isSuggested && (
						<p className="payments__method-suggested">{ translate( 'Suggested Method' ) }</p>
					) }
					<p className={ methodTitle }>{ method.title }</p>
				</ListItemField>
				<ListItemField className="payments__method-method-information-container">
					{ method.fees && <p className="payments__method-information">{ method.fees }</p> }
					{ method.informationUrl && (
						<p className="payments__method-information">
							<ExternalLink icon href={ method.informationUrl } target="_blank">
								{ translate( 'More information' ) }
							</ExternalLink>
						</p>
					) }
				</ListItemField>
				<ListItemField className="payments__method-enable-container">
					<FormFieldset className="payments__method-enable">
						{ this.renderEnabledField( method ) }
					</FormFieldset>
				</ListItemField>
				<ListItemField className="payments__method-action-container">
					<Button compact onClick={ this.onEditHandler }>
						{ editButtonText }
					</Button>
				</ListItemField>
				{ currentlyEditingId === method.id && this.outputEditComponent() }
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
		},
		dispatch
	);
}

export default localize( connect( mapStateToProps, mapDispatchToProps )( PaymentMethodItem ) );
