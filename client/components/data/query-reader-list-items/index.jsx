/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestReaderListItems } from 'state/reader/lists/actions';

class QueryReaderListItems extends Component {
	componentDidMount() {
		this.props.requestReaderListItems();
	}

	render() {
		return null;
	}
}

export default connect( null, { requestReaderListItems } )( QueryReaderListItems );
