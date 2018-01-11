/** @format */

/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchLocations } from 'woocommerce/state/sites/locations/actions';

class QueryLocations extends Component {
	static propTypes = {
		fetchLocations: PropTypes.func,
		siteId: PropTypes.number.isRequired,
	};

	componentDidMount = () => {
		this.props.fetchLocations( this.props.siteId );
	};

	componentDidUpdate = () => {
		this.props.fetchLocations( this.props.siteId );
	};

	render = () => {
		return null;
	};
}

export default connect( null, { fetchLocations } )( QueryLocations );
