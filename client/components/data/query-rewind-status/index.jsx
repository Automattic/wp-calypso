/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getRewindStatus as getRewindStatusAction } from 'state/activity-log/actions';

class QueryRewindStatus extends Component {
	static propTypes = {
		siteId: PropTypes.number,
	};

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId ) {
			return;
		}

		this.request( nextProps );
	}

	request( { siteId } ) {
		if ( siteId ) {
			this.props.getRewindStatus( siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, {
	getRewindStatus: getRewindStatusAction,
} )( QueryRewindStatus );
