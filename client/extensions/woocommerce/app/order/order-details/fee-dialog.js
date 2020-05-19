/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { trim, uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import { Button, Dialog } from '@automattic/components';
import { editOrder } from 'woocommerce/state/ui/orders/actions';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import { getCurrencyFormatDecimal } from 'woocommerce/lib/currency';
import { getOrderWithEdits } from 'woocommerce/state/ui/orders/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import PriceInput from 'woocommerce/components/price-input';

class OrderFeeDialog extends Component {
	static propTypes = {
		isVisible: PropTypes.bool.isRequired,
		editOrder: PropTypes.func.isRequired,
		order: PropTypes.shape( {
			currency: PropTypes.string.isRequired,
			id: PropTypes.oneOfType( [
				PropTypes.number, // A number indicates an existing order
				PropTypes.shape( { id: PropTypes.string } ), // Placeholders have format { id: 'order_1' }
			] ).isRequired,
		} ),
		siteId: PropTypes.number.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		name: '',
		total: 0,
	};

	UNSAFE_componentWillUpdate( nextProps ) {
		// Dialog is being closed, clear the state
		if ( this.props.isVisible && ! nextProps.isVisible ) {
			this.setState( {
				name: '',
				total: 0,
			} );
		}
	}

	handleChange = ( event ) => {
		const value = event.target.value;
		switch ( event.target.name ) {
			case 'new_fee_name':
				this.setState( { name: value } );
				break;
			case 'new_fee_total':
				// If value is a positive number, we can use it
				if ( ! isNaN( parseFloat( value ) ) && parseFloat( value ) >= 0 ) {
					this.setState( { total: value } );
				} else {
					this.setState( { total: '' } );
				}
				break;
		}
	};

	formatCurrencyInput = () => {
		const { currency } = this.props.order;
		this.setState( ( prevState ) => ( {
			total: getCurrencyFormatDecimal( prevState.total, currency ),
		} ) );
	};

	handleFeeSave = () => {
		const { siteId, order } = this.props;
		if ( siteId ) {
			const { name, total } = this.state;
			const feeLines = order.fee_lines || [];
			const tempId = uniqueId( 'fee_' );
			this.props.editOrder( siteId, {
				id: order.id,
				fee_lines: [ ...feeLines, { id: tempId, name, total } ],
			} );
		}
		this.props.closeDialog();
	};

	hasValidValues = () => {
		const { currency } = this.props.order;

		const hasName = !! trim( this.state.name );
		const hasValue = getCurrencyFormatDecimal( this.state.total, currency ) > 0;
		return hasName && hasValue;
	};

	render() {
		const { closeDialog, isVisible, order, translate } = this.props;
		const dialogClass = 'woocommerce order-details__dialog'; // eslint/css specificity hack

		const canSave = this.hasValidValues();

		const dialogButtons = [
			<Button onClick={ closeDialog }>{ translate( 'Cancel' ) }</Button>,
			<Button primary onClick={ this.handleFeeSave } disabled={ ! canSave }>
				{ translate( 'Add fee' ) }
			</Button>,
		];

		return (
			<Dialog
				isVisible={ isVisible }
				onClose={ closeDialog }
				className={ dialogClass }
				buttons={ dialogButtons }
			>
				<h1>{ translate( 'Add a fee' ) }</h1>
				<FormLabel htmlFor="newFeeName">{ translate( 'Name' ) }</FormLabel>
				<FormTextInput
					id="new_fee_name"
					name="new_fee_name"
					type="text"
					value={ this.state.name }
					onChange={ this.handleChange }
				/>
				<FormLabel htmlFor="newFeeTotal">{ translate( 'Value' ) }</FormLabel>
				<PriceInput
					id="new_fee_total"
					name="new_fee_total"
					currency={ order.currency }
					value={ this.state.total }
					onChange={ this.handleChange }
					onBlur={ this.formatCurrencyInput }
				/>
			</Dialog>
		);
	}
}

export default connect(
	( state ) => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : false;
		const order = getOrderWithEdits( state );

		return {
			siteId,
			order,
		};
	},
	( dispatch ) => bindActionCreators( { editOrder }, dispatch )
)( localize( OrderFeeDialog ) );
