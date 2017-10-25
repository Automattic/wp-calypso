/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Dialog from 'components/dialog';
import { editOrder } from 'woocommerce/state/ui/orders/actions';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import { getOrderWithEdits } from 'woocommerce/state/ui/orders/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import PriceInput from 'woocommerce/components/price-input';

class OrderFeeDialog extends Component {
	static propTypes = {
		isVisible: PropTypes.bool.isRequired,
		editOrder: PropTypes.func.isRequired,
		order: PropTypes.shape( {
			currency: PropTypes.string.isRequired,
			id: PropTypes.number.isRequired,
		} ),
		siteId: PropTypes.number.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		name: '',
		total: 0,
	};

	componentWillUpdate( nextProps ) {
		// Dialog is being closed, clear the state
		if ( this.props.isVisible && ! nextProps.isVisible ) {
			this.setState( {
				name: '',
				total: 0,
			} );
		}
	}

	handleChange = event => {
		switch ( event.target.name ) {
			case 'new_fee_name':
				this.setState( { name: event.target.value } );
				break;
			case 'new_fee_total':
				this.setState( { total: event.target.value } );
				break;
		}
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

	render() {
		const { closeDialog, isVisible, order, translate } = this.props;
		const dialogClass = 'woocommerce order-details__dialog'; // eslint/css specificity hack

		const dialogButtons = [
			<Button onClick={ closeDialog }>{ translate( 'Cancel' ) }</Button>,
			<Button primary onClick={ this.handleFeeSave }>
				{ translate( 'Add Fee' ) }
			</Button>,
		];

		return (
			<Dialog
				isVisible={ isVisible }
				onClose={ closeDialog }
				className={ dialogClass }
				buttons={ dialogButtons }
				additionalClassNames="order-payment__dialog woocommerce"
			>
				<h1>{ translate( 'Add a fee' ) }</h1>
				<FormLabel htmlFor="newFeeName">{ translate( 'Fee name' ) }</FormLabel>
				<FormTextInput
					id="new_fee_name"
					name="new_fee_name"
					type="text"
					value={ this.state.name }
					onChange={ this.handleChange }
				/>
				<FormLabel htmlFor="newFeeTotal">{ translate( 'Fee value' ) }</FormLabel>
				<PriceInput
					id="new_fee_total"
					name="new_fee_total"
					currency={ order.currency }
					value={ this.state.total }
					onChange={ this.handleChange }
				/>
			</Dialog>
		);
	}
}

export default connect(
	state => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : false;
		const order = getOrderWithEdits( state );

		return {
			siteId,
			order,
		};
	},
	dispatch => bindActionCreators( { editOrder }, dispatch )
)( localize( OrderFeeDialog ) );
