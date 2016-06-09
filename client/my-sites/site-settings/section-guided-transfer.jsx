/**
 * External dependencies
 */
import React, { Component } from 'react';
import { Provider } from 'react-redux';

/**
 * Internal dependencies
 */
import GuidedTransfer from 'my-sites/guided-transfer';

export default class extends Component {
	render() {
		return (
			<Provider store={ this.props.store }>
				<GuidedTransfer />
			</Provider>
		);
	}
}
