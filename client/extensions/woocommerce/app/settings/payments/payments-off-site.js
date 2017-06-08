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
import {
	changePaymentMethodField,
	closeEditingPaymentMethod,
	openPaymentMethodForEdit
} from 'woocommerce/state/ui/payments/methods/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import ExtendedHeader from 'woocommerce/components/extended-header';
import { fetchPaymentMethods, paymentMethodSave } from 'woocommerce/state/sites/payment-methods/actions';
import { getCurrentlyEditingPaymentMethod, getPaymentMethodsGroup } from 'woocommerce/state/ui/payments/methods/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import List from 'woocommerce/components/list/list';
import ListHeader from 'woocommerce/components/list/list-header';
import ListItemField from 'woocommerce/components/list/list-item-field';
import PaymentMethodEdit from './payment-method-edit';
import PaymentMethodItem from './payment-method-item';

class SettingsPaymentsOffSite extends Component {
	static propTypes = {
		closeEditingPaymentMethod: PropTypes.func.isRequired,
		currentlyEditingMethod: PropTypes.object,
		fetchPaymentMethods: PropTypes.func.isRequired,
		openPaymentMethodForEdit: PropTypes.func.isRequired,
		paymentMethods: PropTypes.array,
		paymentMethodSave: PropTypes.func,
		siteId: PropTypes.number,
	};

	componentDidMount() {
		this.props.fetchPaymentMethods();
	}

	onCancel = ( method ) => {
		const { siteId } = this.props;
		this.props.closeEditingPaymentMethod( siteId, method.id );
	}

	onEdit = ( method ) => {
		const { siteId } = this.props;
		this.props.openPaymentMethodForEdit( siteId, method.id );
	}

	onEditField = ( field, value ) => {
		const { siteId } = this.props;
		this.props.changePaymentMethodField( siteId, field, value );
	}

	onSave = ( method ) => {
		const { siteId, translate } = this.props;

		const successAction = () => {
			this.props.closeEditingPaymentMethod( siteId, method.id );
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

		this.props.paymentMethodSave( siteId, method, successAction, errorAction );
	}

	renderMethodItem = ( method ) => {
		const currentlyEditingId = this.props.currentlyEditingMethod &&
			this.props.currentlyEditingMethod.id;
		return (
			<div key={ method.title }>
				<PaymentMethodItem
					currentlyEditingId={ currentlyEditingId }
					method={ method }
					onCancel={ this.onCancel }
					onEdit={ this.onEdit } />
				{ currentlyEditingId === method.id && (
					<PaymentMethodEdit
						method={ this.props.currentlyEditingMethod }
						onEditField={ this.onEditField }
						onSave={ this.onSave } />
				) }
			</div>
		);
	}

	render() {
		const { translate, paymentMethods } = this.props;

		return (
			<div className="payments__off-site-container">
				<ExtendedHeader
					label={ translate( 'Off-site credit card payment methods' ) }
					description={
						translate(
							'Off-site payment methods involve sending the customer to a ' +
							'third party web site to complete payment, like PayPal. More ' +
							'information'
						)
					} />
					<List>
						<ListHeader>
							<ListItemField className="payments__methods-column-method">
								{ translate( 'Method' ) }
							</ListItemField>
							<ListItemField className="payments__methods-column-fees">
								{ translate( 'Fees' ) }
							</ListItemField>
							<ListItemField className="payments__methods-column-settings">
							</ListItemField>
						</ListHeader>
						{ paymentMethods && paymentMethods.map( this.renderMethodItem ) }
					</List>
			</div>
		);
	}
}

function mapStateToProps( state ) {
	const currentlyEditingMethod = getCurrentlyEditingPaymentMethod( state );
	const paymentMethods = getPaymentMethodsGroup( state, 'off-site' );
	const siteId = getSelectedSiteId( state );
	return {
		currentlyEditingMethod,
		paymentMethods,
		siteId,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			changePaymentMethodField,
			closeEditingPaymentMethod,
			fetchPaymentMethods,
			openPaymentMethodForEdit,
			paymentMethodSave,
		},
		dispatch
	);
}

export default localize(
	connect( mapStateToProps, mapDispatchToProps )( SettingsPaymentsOffSite )
);
