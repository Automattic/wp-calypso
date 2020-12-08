/**
 * External dependencies
 */

import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import passToChildren from 'calypso/lib/react-pass-to-children';
import utils from './utils';
import { setQuery } from 'calypso/state/media/actions';
import { fetchNextMediaPage } from 'calypso/state/media/thunks';
import getMediaSortedByDate from 'calypso/state/selectors/get-media-sorted-by-date';
import hasNextMediaPage from 'calypso/state/selectors/has-next-media-page';

export class MediaListData extends React.Component {
	static displayName = 'MediaListData';

	static propTypes = {
		siteId: PropTypes.number.isRequired,
		source: PropTypes.string,
		postId: PropTypes.number,
		filter: PropTypes.string,
		search: PropTypes.string,
	};

	UNSAFE_componentWillMount() {
		this.props.setQuery( this.props.siteId, this.getQuery() );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const nextQuery = this.getQuery( nextProps );

		if ( this.props.siteId !== nextProps.siteId || ! isEqual( nextQuery, this.getQuery() ) ) {
			this.props.setQuery( nextProps.siteId, nextQuery );
		}
	}

	getQuery = ( props ) => {
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

			if ( props.source === 'google_photos' ) {
				// Add any query params specific to Google Photos
				return utils.getGoogleQuery( query, props );
			}
		}

		return query;
	};

	fetchData = () => {
		this.props.fetchNextMediaPage( this.props.siteId );
	};

	render() {
		return passToChildren( this, {
			mediaHasNextPage: this.props.hasNextPage,
			mediaOnFetchNextPage: this.fetchData,
		} );
	}
}

MediaListData.defaultProps = {
	setQuery: () => {},
};

const mapStateToProps = ( state, ownProps ) => ( {
	media: getMediaSortedByDate( state, ownProps.siteId ),
	hasNextPage: hasNextMediaPage( state, ownProps.siteId ),
} );

export default connect( mapStateToProps, { fetchNextMediaPage, setQuery } )( MediaListData );
