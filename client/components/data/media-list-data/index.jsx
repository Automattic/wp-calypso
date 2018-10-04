/** @format */

/**
 * External dependencies
 */

import { assign, isEqual } from 'lodash';
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
		mediaFetchingNextPage: MediaListStore.isFetchingNextPage( siteId ),
	};
}

export default class extends React.Component {
	static displayName = 'MediaListData';

	static propTypes = {
		siteId: PropTypes.number.isRequired,
		source: PropTypes.string,
		postId: PropTypes.number,
		filter: PropTypes.string,
		search: PropTypes.string,
	};

	state = getStateData( this.props.siteId );

	componentWillMount() {
		MediaActions.setQuery( this.props.siteId, this.getQuery() );
		MediaListStore.on( 'change', this.updateStateData );
		this.updateStateData();
	}

	componentWillUnmount() {
		MediaListStore.off( 'change', this.updateStateData );
	}

	componentWillReceiveProps( nextProps ) {
		const nextQuery = this.getQuery( nextProps );

		if ( this.props.siteId !== nextProps.siteId || ! isEqual( nextQuery, this.getQuery() ) ) {
			MediaActions.setQuery( nextProps.siteId, nextQuery );
			this.setState( getStateData( nextProps.siteId ) );
		}
	}

	getQuery = props => {
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
	};

	fetchData = () => {
		MediaActions.fetchNextPage( this.props.siteId );
	};

	updateStateData = () => {
		this.setState( getStateData( this.props.siteId ) );
	};

	render() {
		return passToChildren(
			this,
			assign( {}, this.state, {
				mediaOnFetchNextPage: this.fetchData,
			} )
		);
	}
}
