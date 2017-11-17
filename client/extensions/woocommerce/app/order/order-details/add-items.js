/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import OrderFeeDialog from './fee-dialog';
import OrderProductDialog from './product-dialog';

class OrderAddItems extends Component {
	state = {
		showDialog: false,
	};

	toggleDialog = type => () => {
		this.setState( { showDialog: type } );
	};

	render() {
		const { translate } = this.props;
		return (
			<div className="order-details__actions">
				<Button borderless onClick={ this.toggleDialog( 'product' ) }>
					<Gridicon icon="plus-small" />
					{ translate( 'Add Product' ) }
				</Button>
				<Button borderless onClick={ this.toggleDialog( 'fee' ) }>
					<Gridicon icon="plus-small" />
					{ translate( 'Add Fee' ) }
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
