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
 *  QueryReaderTag takes 1 parameter (the tag ) and will fetch it
 *  and add to the state tree
 */
class QueryReaderTag extends Component {
	static propTypes = {
		requestTag: PropTypes.func.isRequired,
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
