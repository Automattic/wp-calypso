/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import isShallowEqual from '@wordpress/is-shallow-equal';

/**
 * Internal dependencies
 */
import { fetchFollowers } from 'calypso/state/followers/thunks';

const REFRESH_INTERVAL = 1000 * 30;

class QueryFollowers extends React.Component {
	interval = null;

	componentDidMount() {
		this.props.fetchFollowers( this.props.query );

		if ( this.props.refresh ) {
			this.interval = setInterval(
				() => this.refreshFollowers(),
				this.props.refreshInterval || REFRESH_INTERVAL
			);
		}
	}

	componentDidUpdate( prevProps ) {
		if ( ! isShallowEqual( prevProps.query, this.props.query ) ) {
			this.props.fetchFollowers( this.props.query );
		}
	}

	componentWillUnmount() {
		if ( this.interval ) {
			clearInterval( this.interval );
		}
	}

	refreshFollowers() {
		this.props.fetchFollowers( this.props.query, true );
	}

	render() {
		return null;
	}
}

export default connect( null, { fetchFollowers } )( QueryFollowers );
