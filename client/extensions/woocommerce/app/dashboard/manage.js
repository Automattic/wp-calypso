/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import ManageNoOrders from './manage-no-orders';
import ManageOrders from './manage-orders';

class Manage extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			slug: PropTypes.string.isRequired,
		} ),
	};

	render = () => {
		const { site } = this.props;
		const storeHasOrders = false; // TODO - hook up to a selector

		return (
			<div className="dashboard__manage-wrapper">
			{
				storeHasOrders ? <ManageOrders site={ site } /> : <ManageNoOrders site={ site } />
			}
			</div>
		);
	}
}

export default Manage;
