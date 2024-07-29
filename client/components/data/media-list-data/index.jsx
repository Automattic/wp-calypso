import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import passToChildren from 'calypso/lib/react-pass-to-children';
import { setQuery } from 'calypso/state/media/actions';
import { fetchNextMediaPage } from 'calypso/state/media/thunks';
import getMediaSortedByDate from 'calypso/state/selectors/get-media-sorted-by-date';
import hasNextMediaPage from 'calypso/state/selectors/has-next-media-page';
import utils from './utils';

export class MediaListData extends Component {
	static displayName = 'MediaListData';

	static propTypes = {
		siteId: PropTypes.number.isRequired,
		source: PropTypes.string,
		postId: PropTypes.number,
		filter: PropTypes.string,
		search: PropTypes.string,
	};

	componentDidMount() {
		this.props.setQuery( this.props.siteId, this.getQuery() );
	}

	componentDidUpdate( prevProps ) {
		const nextQuery = this.getQuery();

		if (
			prevProps.siteId !== this.props.siteId ||
			! isEqual( nextQuery, this.getQuery( prevProps ) )
		) {
			this.props.setQuery( this.props.siteId, nextQuery );
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
			query.path = 'session';

			if ( props.source === 'google_photos_picker' ) {
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
