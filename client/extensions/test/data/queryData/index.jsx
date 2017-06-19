/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestData } from '../../state/actions';

class QueryData extends Component {
	componentWillMount() {
		this.props.requestData( this.props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId } ) => {
		return {};
	},
	{ requestData }
)( QueryData );
