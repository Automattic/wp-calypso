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
	openPaymentMethodForEdit,
} from 'woocommerce/state/ui/payments/methods/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import { fetchPaymentMethods, savePaymentMethod } from 'woocommerce/state/sites/payment-methods/actions';
import { getCurrentlyEditingPaymentMethod, getPaymentMethodsGroup } from 'woocommerce/state/ui/payments/methods/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import List from 'woocommerce/components/list/list';
import ListHeader from 'woocommerce/components/list/list-header';
import ListItemField from 'woocommerce/components/list/list-item-field';
import PaymentMethodEdit from './payment-method-edit';
import PaymentMethodItem from './payment-method-item';

class SettingsPaymentsMethodList extends Component {
	static propTypes = {
		closeEditingPaymentMethod: PropTypes.func.isRequired,
		currentlyEditingMethod: PropTypes.shape( {
			id: PropTypes.string,
		} ),
		fetchPaymentMethods: PropTypes.func.isRequired,
		methodType: PropTypes.string.isRequired,
		openPaymentMethodForEdit: PropTypes.func.isRequired,
		paymentMethods: PropTypes.array.isRequired,
		savePaymentMethod: PropTypes.func.isRequired,
		site: PropTypes.object,
	};

	componentDidMount() {
		this.props.fetchPaymentMethods();
	}

	onCancel = ( method ) => {
		this.props.closeEditingPaymentMethod( this.props.site.ID, method.id );
	}

	onEdit = ( method ) => {
		const { site } = this.props;
		this.props.openPaymentMethodForEdit( site.ID, method.id );
	}

	onEditField = ( field, value ) => {
		this.props.changePaymentMethodField( this.props.site.ID, field, value );
	}

	onSave = ( method ) => {
		const { site, translate } = this.props;

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

	renderMethodItem = ( method ) => {
		const currentlyEditingId = this.props.currentlyEditingMethod &&
			this.props.currentlyEditingMethod.id;
		const methodTypeClass = `payments__methods-${ this.props.methodType }`;
		return (
			<div className={ methodTypeClass } key={ method.title }>
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
		const { translate, methodType, paymentMethods } = this.props;

		return (
			<List>
				<ListHeader>
					<ListItemField className="payments__methods-column-method">
						{ translate( 'Method' ) }
					</ListItemField>
					{ methodType !== 'offline' && (
						<ListItemField className="payments__methods-column-fees">
							{ translate( 'Fees' ) }
						</ListItemField>
					) }
					<ListItemField className="payments__methods-column-settings">
					</ListItemField>
				</ListHeader>
				{ paymentMethods && paymentMethods.map( this.renderMethodItem ) }
			</List>
		);
	}
}

function mapStateToProps( state, ownProps ) {
	const currentlyEditingMethod = getCurrentlyEditingPaymentMethod( state );
	const paymentMethods = getPaymentMethodsGroup( state, ownProps.methodType );
	const site = getSelectedSiteWithFallback( state );
	return {
		currentlyEditingMethod,
		paymentMethods,
		site,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			changePaymentMethodField,
			closeEditingPaymentMethod,
			fetchPaymentMethods,
			openPaymentMethodForEdit,
			savePaymentMethod,
		},
		dispatch
	);
}

export default localize(
	connect( mapStateToProps, mapDispatchToProps )( SettingsPaymentsMethodList )
);
