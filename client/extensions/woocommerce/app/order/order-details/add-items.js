/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { isObject } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import OrderFeeDialog from './fee-dialog';
import OrderProductDialog from './product-dialog';

class OrderAddItems extends Component {
	static propTypes = {
		orderId: PropTypes.oneOfType( [ PropTypes.number, PropTypes.object ] ).isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		showDialog: false,
	};

	toggleDialog = ( type ) => () => {
		this.setState( { showDialog: type } );
	};

	render() {
		const { orderId, translate } = this.props;
		const isNewOrder = isObject( orderId );
		return (
			<div className="order-details__actions">
				<Button
					borderless={ ! isNewOrder }
					primary={ isNewOrder }
					onClick={ this.toggleDialog( 'product' ) }
				>
					{ translate( 'Add product' ) }
				</Button>
				<Button borderless onClick={ this.toggleDialog( 'fee' ) }>
					{ translate( 'Add fee' ) }
				</Button>
				<OrderFeeDialog
					isVisible={ 'fee' === this.state.showDialog }
					closeDialog={ this.toggleDialog( false ) }
				/>
				<OrderProductDialog
					isVisible={ 'product' === this.state.showDialog }
					closeDialog={ this.toggleDialog( false ) }
				/>
			</div>
		);
	}
}

export default localize( OrderAddItems );
