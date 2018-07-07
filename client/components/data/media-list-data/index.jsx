/** @format */

/**
 * External dependencies
 */

import { assign, isEqual, noop } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import MediaActions from 'lib/media/actions';
import MediaListStore from 'lib/media/list-store';
import passToChildren from 'lib/react-pass-to-children';
import utils from './utils';

function getStateData( siteId, cb = noop ) {
	const data = {
		media: MediaListStore.getAll( siteId ),
		mediaHasNextPage: MediaListStore.hasNextPage( siteId ),
		mediaFetchingNextPage: MediaListStore.isFetchingNextPage( siteId ),
	};

	cb( data );
	return data;
}

export default class extends React.Component {
	static displayName = 'MediaListData';

	static propTypes = {
		siteId: PropTypes.number.isRequired,
		source: PropTypes.string,
		postId: PropTypes.number,
		filter: PropTypes.string,
		search: PropTypes.string,
		folder: PropTypes.string,
		onGetData: PropTypes.func,
	};

	static defaultProps = {
		onGetData: noop,
	};

	state = getStateData( this.props.siteId, this.props.onGetData );

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
			this.setState( getStateData( nextProps.siteId, nextProps.onGetData ) );
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
			query.path = props.folder || 'recent';
		}

		if ( props.folder ) {
			query.folder = props.folder;
		}

		return query;
	};

	fetchData = () => {
		MediaActions.fetchNextPage( this.props.siteId );
	};

	updateStateData = () => {
		this.setState( getStateData( this.props.siteId, this.props.onGetData ) );
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
