/** @format */
/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestPostCounts } from 'state/posts/counts/actions';
import { isRequestingPostCounts } from 'state/posts/counts/selectors';

class QueryPostCounts extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId && this.props.type === nextProps.type ) {
			return;
		}

		this.request( nextProps );
	}

	request( props ) {
		if ( props.requesting ) {
			return;
		}

		props.requestPostCounts( props.siteId, props.type );
	}

	render() {
		return null;
	}
}

QueryPostCounts.propTypes = {
	siteId: PropTypes.number.isRequired,
	type: PropTypes.string.isRequired,
	requesting: PropTypes.bool,
	requestPostCounts: PropTypes.func,
};

export default connect(
	( state, ownProps ) => {
		const { siteId, type } = ownProps;
		return {
			requesting: isRequestingPostCounts( state, siteId, type ),
		};
	},
	{ requestPostCounts }
)( QueryPostCounts );
