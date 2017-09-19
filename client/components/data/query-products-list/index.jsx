/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestProductsList } from 'state/products-list/actions';
import { isProductsListFetching as isFetching } from 'state/products-list/selectors';

class QueryProductsList extends Component {
	componentWillMount() {
		if ( ! this.props.isFetching ) {
			this.props.requestProductsList();
		}
	}

	render() {
		return null;
	}
}

QueryProductsList.propTypes = {
	isFetching: PropTypes.bool,
	requestProductsList: PropTypes.func
};

export default connect(
	state => ( { isFetching: isFetching( state ) } ),
	{ requestProductsList }
)( QueryProductsList );
