/** @format */

/**
 * External dependencies
 */

import { assign, isEqual, has } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { moment } from 'i18n-calypso';

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
		queryFilters: PropTypes.object,
	};

	static defaultProps = {
		filter: '',
		queryFilters: {},
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

		// Initialise here as we may need to append to it later...
		query.filter = [];

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

		// Convert date range to query format
		if ( has( props, 'queryFilters.dateRange' ) ) {
			// Date passed as: YYYY-MM-DD:YYYY-MM-DD (with 0 indicating an 'empty' value)
			// https://developers.google.com/photos/library/reference/rest/v1/mediaItems/search#Date
			const wildCardDate = '0000-00-00';
			const dateFormat = 'YYYY-MM-DD';

			let dateFrom = wildCardDate;
			let dateTo = wildCardDate;

			if (
				has( props, 'queryFilters.dateRange.from' ) &&
				moment( props.queryFilters.dateRange.from, dateFormat ).isValid()
			) {
				dateFrom = props.queryFilters.dateRange.from;
			}

			if (
				has( props, 'queryFilters.dateRange.to' ) &&
				moment( props.queryFilters.dateRange.to, dateFormat ).isValid()
			) {
				dateTo = props.queryFilters.dateRange.to;
			}

			// As long as from/to are not BOTH wildcards then add a range filter
			// otherwise do not add a filter as there isn't any reason to do so...
			if ( dateFrom !== wildCardDate && dateTo !== wildCardDate ) {
				query.filter = [ ...query.filter, `dateRange=${ dateFrom }:${ dateTo }` ];
			}
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
