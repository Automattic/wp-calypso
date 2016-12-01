/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchFollowers } from 'state/followers/actions';

class QueryFollowerCounts extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId ) {
			return;
		}

		this.request( nextProps );
	}

	request( props ) {
		if ( props.requesting ) {
			return;
		}

		props.fetchFollowers( { siteId: props.siteId } );
	}

	render() {
		return null;
	}
}

QueryFollowerCounts.propTypes = {
	siteId: PropTypes.number.isRequired,
	requesting: PropTypes.bool, //TODO: requesting state
};

export default connect(
	( ) => {
		return {
			requesting: false,
		};
	},
	{ fetchFollowers }
)( QueryFollowerCounts );
