import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryReaderList from 'calypso/components/data/query-reader-list';
import ReaderMain from 'calypso/reader/components/reader-main';
import ListEmpty from 'calypso/reader/list-stream/components/empty';
import ReaderListHeader from 'calypso/reader/list-stream/components/list-header';
import ListMissing from 'calypso/reader/list-stream/components/missing';
import ListSites from 'calypso/reader/list-stream/views/sites';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import Stream from 'calypso/reader/stream';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { followList, unfollowList } from 'calypso/state/reader/lists/actions';
import {
	getListByOwnerAndSlug,
	isSubscribedByOwnerAndSlug,
	hasRequestedListByOwnerAndSlug,
	isMissingByOwnerAndSlug,
} from 'calypso/state/reader/lists/selectors';

class ListStream extends Component {
	constructor( props ) {
		super( props );
		this.title = props.translate( 'Loading list' );
	}

	toggleFollowing = ( isFollowRequested ) => {
		const list = this.props.list;

		if ( isFollowRequested ) {
			this.props.followList( list.owner, list.slug );
		} else {
			this.props.unfollowList( list.owner, list.slug );
		}

		recordAction( isFollowRequested ? 'followed_list' : 'unfollowed_list' );
		recordGaEvent(
			isFollowRequested ? 'Clicked Follow List' : 'Clicked Unfollow List',
			list.owner + ':' + list.slug
		);
		this.props.recordReaderTracksEvent(
			isFollowRequested
				? 'calypso_reader_reader_list_followed'
				: 'calypso_reader_reader_list_unfollowed',
			{
				list_owner: list.owner,
				list_slug: list.slug,
			}
		);
	};

	render() {
		const list = this.props.list;

		if ( ! this.props.hasRequested ) {
			return <QueryReaderList owner={ this.props.owner } slug={ this.props.slug } />;
		}

		if ( this.props.isMissing ) {
			return <ListMissing />;
		}

		const title = list?.title || this.title;
		const headerElement = (
			<>
				<DocumentHead
					title={ this.props.translate( '%s ‹ Reader', {
						args: title,
						comment: '%s is the section name. For example: "My Likes"',
					} ) }
				/>
				<ReaderListHeader
					list={ list }
					currentUser={ this.props.currentUser }
					following={ this.props.isSubscribed }
					onFollowToggle={ this.toggleFollowing }
					view={ this.props.view }
				/>
			</>
		);

		switch ( this.props.view ) {
			case 'sites':
				return (
					<ReaderMain>
						<div>
							{ headerElement }
							{ list && <ListSites list={ list } /> }
						</div>
					</ReaderMain>
				);
			default:
				return (
					<Stream
						{ ...this.props }
						listName={ this.title }
						emptyContent={ () => <ListEmpty list={ list } /> }
						showFollowInHeader={ list && ! list?.is_owner }
					>
						{ headerElement }
					</Stream>
				);
		}
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			list: getListByOwnerAndSlug( state, ownProps.owner, ownProps.slug ),
			isSubscribed: isSubscribedByOwnerAndSlug( state, ownProps.owner, ownProps.slug ),
			hasRequested: hasRequestedListByOwnerAndSlug( state, ownProps.owner, ownProps.slug ),
			isMissing: isMissingByOwnerAndSlug( state, ownProps.owner, ownProps.slug ),
			currentUser: getCurrentUser( state ),
		};
	},
	{ followList, recordReaderTracksEvent, unfollowList }
)( localize( ListStream ) );
