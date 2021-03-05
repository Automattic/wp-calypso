/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import isShallowEqual from '@wordpress/is-shallow-equal';

/**
 * Internal dependencies
 */
import { requestFollowers } from 'calypso/state/followers/actions';

const REFRESH_INTERVAL = 1000 * 30;

class QueryFollowers extends React.Component {
	interval = null;

	componentDidMount() {
		this.props.requestFollowers( this.props.query );

		this.interval = setInterval( () => this.refreshFollowers(), REFRESH_INTERVAL );
	}

	componentDidUpdate( prevProps ) {
		if ( ! isShallowEqual( prevProps.query, this.props.query ) ) {
			this.props.requestFollowers( this.props.query );
		}
	}

	componentWillUnmount() {
		if ( this.interval ) {
			clearInterval( this.interval );
		}
	}

	refreshFollowers() {
		this.props.requestFollowers( this.props.query, true );
	}

	render() {
		return null;
	}
}

export default connect( null, { requestFollowers } )( QueryFollowers );
