/** @format */

/**
 * External dependencies
 */

import { Component } from 'react';
import { connect } from 'react-redux';
import { v4 as uuid } from 'uuid';

/**
 * Internal Dependencies
 */
import { cartSync, cartSyncOn, cartSyncOff } from 'state/cart/actions';

class QueryCart extends Component {
	constructor( props ) {
		super( props );

		this.state = { syncKey: 'QueryCart' + uuid() };

		props.cartSyncOn( this.state.syncKey );

		cartSync(); // initial sync
	}

	componentWillUnmount = () => this.props.cartSyncOff( this.state.syncKey );

	render = () => null;
}

export default connect(
	( { cart } ) => ( { cart } ), // example usage
	{ cartSync, cartSyncOn, cartSyncOff }
)( QueryCart );
