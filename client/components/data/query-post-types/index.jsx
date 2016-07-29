/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingPostTypes } from 'state/post-types/selectors';
import { requestPostTypes } from 'state/post-types/actions';

class QueryPostTypes extends Component {
	componentWillMount() {
		if ( ! this.props.requestingPostTypes && this.props.siteId ) {
			this.props.requestPostTypes( this.props.siteId );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.requestingPostTypes ||
				! nextProps.siteId ||
				( this.props.siteId === nextProps.siteId ) ) {
			return;
		}

		nextProps.requestPostTypes( nextProps.siteId );
	}

	render() {
		return null;
	}
}

QueryPostTypes.propTypes = {
	siteId: PropTypes.number,
	requestingPostTypes: PropTypes.bool,
	requestPostTypes: PropTypes.func
};

QueryPostTypes.defaultProps = {
	requestPostTypes: () => {}
};

export default connect(
	( state, ownProps ) => {
		return {
			requestingPostTypes: isRequestingPostTypes( state, ownProps.siteId )
		};
	},
	{ requestPostTypes }
)( QueryPostTypes );
