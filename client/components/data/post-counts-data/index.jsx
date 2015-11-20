/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import actions from 'lib/posts/actions';
import PostCountsStore from 'lib/posts/post-counts-store';

function getState( siteId, status ) {
	const counts = PostCountsStore.get( siteId ) || {};
	let count;

	if ( counts && status ) {
		count = counts[ status ];

		// include `pending` in `draft` count
		if ( status === 'draft' && counts.pending ) {
			count += counts.pending;
		}
	}

	return {
		count: count
	};
}

export default React.createClass( {
	displayName: 'PostCountsData',

	propTypes: {
		siteId: React.PropTypes.number.isRequired,
		status: React.PropTypes.string
	},

	getInitialState() {
		return getState( this.props.siteId, this.props.status );
	},

	componentDidMount() {
		PostCountsStore.on( 'change', this.updateState );
		this.fetchCounts( this.props.siteId );
	},

	componentWillUnmount() {
		PostCountsStore.off( 'change', this.updateState );
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			this.updateState( nextProps.siteId );
			this.fetchCounts( nextProps.siteId );
		}
	},

	updateState( siteId ) {
		siteId = siteId || this.props.siteId;
		return this.setState( getState( siteId, this.props.status ) );
	},

	fetchCounts( siteId ) {
		if ( PostCountsStore.get( siteId ) ) {
			return;
		}

		setTimeout( function() {
			actions.fetchCounts( siteId );
		}, 0 );
	},

	render() {
		return React.cloneElement( this.props.children, this.state );
	}
} );
