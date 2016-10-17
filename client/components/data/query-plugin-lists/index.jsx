/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchPluginsList } from 'state/plugins/wporg/actions';

class QueryPluginLists extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	request( props ) {
		props.categories.forEach( ( category ) => {
			this.props.fetchPluginsList( category );
		} );
	}

	render() {
		return null;
	}
}

QueryPluginLists.propTypes = {
	categories: PropTypes.array.isRequired
};

QueryPluginLists.defaultProps = {
	categories: []
};

export default connect(
	null,
	{ fetchPluginsList }
)( QueryPluginLists );
