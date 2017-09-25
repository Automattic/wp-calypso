import { assign, isEqual } from 'lodash';

/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';

/**
 * Internal dependencies
 */
import MediaActions from 'lib/media/actions';

import MediaListStore from 'lib/media/list-store';
import passToChildren from 'lib/react-pass-to-children';
import utils from './utils';

function getStateData( siteId ) {
	return {
		media: MediaListStore.getAll( siteId ),
		mediaHasNextPage: MediaListStore.hasNextPage( siteId ),
		mediaFetchingNextPage: MediaListStore.isFetchingNextPage( siteId )
	};
}

export default React.createClass( {
	displayName: 'MediaListData',

	propTypes: {
		siteId: PropTypes.number.isRequired,
		source: PropTypes.string,
		postId: PropTypes.number,
		filter: PropTypes.string,
		search: PropTypes.string
	},

	getInitialState: function() {
		return getStateData( this.props.siteId );
	},

	componentWillMount: function() {
		MediaActions.setQuery( this.props.siteId, this.getQuery() );
		MediaListStore.on( 'change', this.updateStateData );
		this.updateStateData();
	},

	componentWillUnmount: function() {
		MediaListStore.off( 'change', this.updateStateData );
	},

	componentWillReceiveProps: function( nextProps ) {
		const nextQuery = this.getQuery( nextProps );

		if ( this.props.siteId !== nextProps.siteId || ! isEqual( nextQuery, this.getQuery() ) ) {
			MediaActions.setQuery( nextProps.siteId, nextQuery );
			this.setState( getStateData( nextProps.siteId ) );
		}
	},

	getQuery: function( props ) {
		const query = {};

		props = props || this.props;

		if ( props.search ) {
			query.search = props.search;
		}

		if ( props.filter && ! props.source ) {
			if ( props.filter === 'this-post' ) {
				if ( props.postId ) {
					query.post_ID = props.postId;
				}
			} else {
				query.mime_type = utils.getMimeBaseTypeFromFilter( props.filter );
			}
		}

		if ( props.source ) {
			query.source = props.source;
			query.path = 'recent';
		}

		return query;
	},

	fetchData: function() {
		MediaActions.fetchNextPage( this.props.siteId );
	},

	updateStateData: function() {
		this.setState( getStateData( this.props.siteId ) );
	},

	render: function() {
		return passToChildren( this, assign( {}, this.state, {
			mediaOnFetchNextPage: this.fetchData
		} ) );
	}
} );
