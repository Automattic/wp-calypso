import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryReaderList from 'calypso/components/data/query-reader-list';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import Stream from 'calypso/reader/stream';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { followList, unfollowList } from 'calypso/state/reader/lists/actions';
import {
	getListByOwnerAndSlug,
	isSubscribedByOwnerAndSlug,
	hasRequestedListByOwnerAndSlug,
	isMissingByOwnerAndSlug,
} from 'calypso/state/reader/lists/selectors';
import EmptyContent from './empty';
import ListStreamHeader from './header';
import ListMissing from './missing';
import './style.scss';

const emptyContent = () => <EmptyContent />;

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
		const shouldShowFollow = list && ! list.is_owner;
		const listStreamIconClasses = 'gridicon gridicon__list';

		if ( ! this.props.hasRequested ) {
			return <QueryReaderList owner={ this.props.owner } slug={ this.props.slug } />;
		}

		if ( list ) {
			this.title = list.title;
		}

		if ( this.props.isMissing ) {
			return <ListMissing owner={ this.props.owner } slug={ this.props.slug } />;
		}

		return (
			<Stream
				{ ...this.props }
				listName={ this.title }
				emptyContent={ emptyContent }
				showFollowInHeader={ shouldShowFollow }
			>
				<DocumentHead
					title={ this.props.translate( '%s ‹ Reader', {
						args: this.title,
						comment: '%s is the section name. For example: "My Likes"',
					} ) }
				/>
				<QueryReaderList owner={ this.props.owner } slug={ this.props.slug } />
				<ListStreamHeader
					isPlaceholder={ ! list }
					isPublic={ list?.is_public }
					icon={
						<svg
							className={ listStreamIconClasses }
							height="32"
							width="32"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
						>
							<g>
								<path
									d="M9 19h10v-2H9v2zm0-6h10v-2H9v2zm0-8v2h10V5H9zm-3-.5c-.828
									0-1.5.672-1.5 1.5S5.172 7.5 6 7.5 7.5 6.828 7.5 6 6.828 4.5 6
									4.5zm0 6c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672
									1.5-1.5-.672-1.5-1.5-1.5zm0 6c-.828 0-1.5.672-1.5 1.5s.672 1.5
									1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5z"
								/>
							</g>
						</svg>
					}
					title={ this.title }
					description={ list?.description }
					showFollow={ shouldShowFollow }
					following={ this.props.isSubscribed }
					onFollowToggle={ this.toggleFollowing }
					showEdit={ list && list.is_owner }
					editUrl={ window.location.href + '/edit' }
				/>
			</Stream>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			list: getListByOwnerAndSlug( state, ownProps.owner, ownProps.slug ),
			isSubscribed: isSubscribedByOwnerAndSlug( state, ownProps.owner, ownProps.slug ),
			hasRequested: hasRequestedListByOwnerAndSlug( state, ownProps.owner, ownProps.slug ),
			isMissing: isMissingByOwnerAndSlug( state, ownProps.owner, ownProps.slug ),
		};
	},
	{ followList, recordReaderTracksEvent, unfollowList }
)( localize( ListStream ) );
