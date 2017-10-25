/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import OrderFeeDialog from './fee-dialog';

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
					{ translate( '+ Add Product' ) }
				</Button>
				<Button borderless onClick={ this.toggleDialog( 'fee' ) }>
					{ translate( '+ Add Fee' ) }
				</Button>
				<OrderFeeDialog
					isVisible={ 'fee' === this.state.showDialog }
					closeDialog={ this.toggleDialog( false ) }
				/>
			</div>
		);
	}
}

export default localize( OrderAddItems );
