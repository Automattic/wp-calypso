/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestFollows } from 'state/reader/follows/actions';

class QueryReaderFollows extends Component {
	componentWillMount() {
		this.props.requestFollows();
	}

	render() {
		return null;
	}
}

export default connect(
	null,
	{ requestFollows },
)( QueryReaderFollows );
