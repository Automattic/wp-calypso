/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { shouldRequestProductsListFromServer } from 'state/products-list/selectors';
import { requestProductsList } from 'state/products-list/actions';

class QueryProductsList extends Component {
	static propTypes = {
		shouldRequest: PropTypes.bool,
		requestProductsList: PropTypes.func,
	};

	componentWillMount() {
		if ( this.props.shouldRequest ) {
			this.props.requestProductsList();
		}
	}

	render() {
		return null;
	}
}

export default connect(
	state => ( {
		shouldRequest: shouldRequestProductsListFromServer( state ),
	} ),
	{ requestProductsList }
)( QueryProductsList );
