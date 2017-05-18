/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getRewindStatus } from 'state/activity-log/actions';
import { isFetchingRewindStatus } from 'state/activity-log/selectors';

class QueryRewindStatus extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired
	};

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( props.requestingRewindStatus ) {
			return;
		}
		props.getRewindStatus( props.siteId );
	}

	render() {
		return null;
	}
}

export const mapDispatchToProps = ( {
	getRewindStatus
} );

export default connect(
	( state, ownProps ) => {
		return {
			requestingRewindStatus: isFetchingRewindStatus( state, ownProps.siteId )
		};
	},
	mapDispatchToProps
)( QueryRewindStatus );
