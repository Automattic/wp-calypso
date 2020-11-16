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

class QueryFollowers extends React.Component {
	componentDidMount() {
		this.props.fetchFollowers( this.props.query );
	}

	componentDidUpdate( prevProps ) {
		if ( ! isShallowEqual( prevProps.query, this.props.query ) ) {
			this.props.fetchFollowers( this.props.query );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { fetchFollowers } )( QueryFollowers );
