/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestTags } from 'state/reader/tags/items/actions';

/**
 *  QueryReaderFollowedTags takes no parameters and will add all of a
 *  users tags to the state tree.
 */
class QueryReaderFollowedTags extends Component {
	static propTypes = {
		requestFollowedTags: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.requestFollowedTags();
	}

	render() {
		return null;
	}
}

export default connect(
	null,
	{ requestFollowedTags: requestTags },
)( QueryReaderFollowedTags );
