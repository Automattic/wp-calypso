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
class QueryReaderTag extends Component {
	static propTypes = {
		requestTags: PropTypes.func.isRequired,
		tag: PropTypes.string.isRequired,
	};

	componentDidMount() {
		this.props.requestTag( this.props.tag );
	}

	render() {
		return null;
	}
}

export default connect(
	null,
	{ requestTag: requestTags },
)( QueryReaderTag );
