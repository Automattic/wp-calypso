import { getUrlParts } from '@automattic/calypso-url';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryReaderFollowedTags from 'calypso/components/data/query-reader-followed-tags';
import QueryReaderTag from 'calypso/components/data/query-reader-tag';
import SegmentedControl from 'calypso/components/segmented-control';
import { navigate } from 'calypso/lib/navigate';
import { createAccountUrl } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/url';
import ReaderMain from 'calypso/reader/components/reader-main';
import HeaderBack from 'calypso/reader/header-back';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import Stream from 'calypso/reader/stream';
import ReaderTagSidebar from 'calypso/reader/stream/reader-tag-sidebar';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { requestFollowTag, requestUnfollowTag } from 'calypso/state/reader/tags/items/actions';
import { getReaderTags, getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';
import getReaderTagBySlug from 'calypso/state/reader/tags/selectors/get-reader-tag-by-slug';
import EmptyContent from './empty';
import TagStreamHeader from './header';
import './style.scss';

const updateQueryArg = ( params ) =>
	page.replace( addQueryArgs( params, window.location.pathname + window.location.search ) );

class TagStream extends Component {
	static propTypes = {
		encodedTagSlug: PropTypes.string,
		decodedTagSlug: PropTypes.string,
		sort: PropTypes.string,
	};

	state = {
		isEmojiTitle: false,
	};

	_isMounted = false;

	componentDidMount() {
		const self = this;
		this._isMounted = true;
		// can't use arrows with asyncRequire
		asyncRequire( 'emoji-text', function ( emojiText ) {
			if ( self._isMounted ) {
				self.setState( { emojiText } );
			}
		} );
		asyncRequire( 'twemoji', function ( twemoji ) {
			if ( self._isMounted ) {
				const title = self.props.decodedTagSlug;
				self.setState( {
					twemoji,
					isEmojiTitle: title && twemoji.test( title ),
				} );
			}
		} );
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	static getDerivedStateFromProps( nextProps, prevState ) {
		if ( ! prevState.twemoji || ! nextProps.decodedTagSlug ) {
			return null;
		}

		return {
			isEmojiTitle: prevState.twemoji.test( nextProps.decodedTagSlug ),
		};
	}

	isSubscribed = () => {
		const tag = find( this.props.tags, { slug: this.props.encodedTagSlug } );
		return !! ( tag && tag.isFollowing );
	};

	toggleFollowing = () => {
		const { decodedTagSlug, unfollowTag, followTag } = this.props;
		const isFollowing = this.isSubscribed(); // this is the current state, not the new state
		const toggleAction = isFollowing ? unfollowTag : followTag;

		if ( ! this.props.isLoggedIn ) {
			const { pathname } = getUrlParts( window.location.href );
			return navigate( createAccountUrl( { redirectTo: pathname, ref: 'reader-lp' } ) );
		}

		toggleAction( decodedTagSlug );
		recordAction( isFollowing ? 'unfollowed_topic' : 'followed_topic' );
		recordGaEvent(
			isFollowing ? 'Clicked Unfollow Topic' : 'Clicked Follow Topic',
			decodedTagSlug
		);
		this.props.recordReaderTracksEvent(
			isFollowing ? 'calypso_reader_reader_tag_unfollowed' : 'calypso_reader_reader_tag_followed',
			{
				tag: decodedTagSlug,
			}
		);
	};

	useRelevanceSort = () => {
		const sort = 'relevance';
		recordAction( 'tag_page_clicked_relevance_sort' );
		this.props.recordReaderTracksEvent( 'calypso_reader_clicked_tag_sort', {
			tag: this.props.encodedTagSlug,
			sort,
		} );
		updateQueryArg( { sort } );
	};

	useDateSort = () => {
		const sort = 'date';
		recordAction( 'tag_page_clicked_date_sort' );
		this.props.recordReaderTracksEvent( 'calypso_reader_clicked_tag_sort', {
			tag: this.props.encodedTagSlug,
			sort,
		} );
		updateQueryArg( { sort } );
	};

	render() {
		const emptyContent = () => <EmptyContent decodedTagSlug={ this.props.decodedTagSlug } />;
		const title = this.props.decodedTagSlug;
		const tag = find( this.props.tags, { slug: this.props.encodedTagSlug } );
		const sortOrder = this.props.sort || 'relevance';
		const titleText = title.replace( /-/g, ' ' );

		// const wideDisplay = this.props.width > WIDE_DISPLAY_CUTOFF;
		// const segmentedControlClass = wideDisplay
		// 	? 'search-stream__sort-picker is-wide'
		// 	: 'search-stream__sort-picker';

		let imageSearchString = this.props.encodedTagSlug;

		// If the tag contains emoji, convert to text equivalent
		if ( this.state.emojiText && this.state.isEmojiTitle ) {
			imageSearchString = this.state.emojiText.convert( title, {
				delimiter: '',
			} );
		}

		if ( tag && tag.error ) {
			return (
				<ReaderMain className="tag-stream__main">
					<QueryReaderFollowedTags />
					<QueryReaderTag tag={ this.props.decodedTagSlug } />
					{ this.props.showBack && <HeaderBack /> }
					<TagStreamHeader
						title={ title }
						imageSearchString={ imageSearchString }
						showFollow={ false }
						showBack={ this.props.showBack }
					/>
					{ emptyContent() }
				</ReaderMain>
			);
		}

		// Put the tag stream header at the top of the body, so it can be even with the sidebar in the two column layout.
		const tagHeader = () => (
			<>
				<TagStreamHeader
					title={ titleText }
					description={ this.props.description }
					imageSearchString={ imageSearchString }
					showFollow={ !! ( tag && tag.id ) }
					following={ this.isSubscribed() }
					onFollowToggle={ this.toggleFollowing }
					showBack={ this.props.showBack }
				/>

				<SegmentedControl compact className="tag-stream__sort-picker">
					<SegmentedControl.Item
						selected={ sortOrder !== 'date' }
						onClick={ this.useRelevanceSort }
					>
						{ this.props.translate( 'Relevance' ) }
					</SegmentedControl.Item>
					<SegmentedControl.Item selected={ sortOrder === 'date' } onClick={ this.useDateSort }>
						{ this.props.translate( 'Date' ) }
					</SegmentedControl.Item>
				</SegmentedControl>
			</>
		);

		return (
			<Stream
				{ ...this.props }
				className="tag-stream__main"
				listName={ title }
				emptyContent={ emptyContent }
				showFollowInHeader={ true }
				forcePlaceholders={ ! tag } // if tag has not loaded yet, then make everything a placeholder
				streamHeader={ tagHeader }
				showSiteNameOnCards={ false }
				useCompactCards={ true }
				streamSidebar={ () => (
					<ReaderTagSidebar tag={ this.props.decodedTagSlug } showFollow={ false } />
				) }
				sidebarTabTitle={ this.props.translate( 'Related' ) }
			>
				<QueryReaderFollowedTags />
				<QueryReaderTag tag={ this.props.decodedTagSlug } />
				{ this.props.showBack && <HeaderBack /> }
			</Stream>
		);
	}
}

export default connect(
	( state, { decodedTagSlug } ) => {
		const tag = getReaderTagBySlug( state, decodedTagSlug );
		return {
			description: tag?.description,
			followedTags: getReaderFollowedTags( state ),
			tags: getReaderTags( state ),
			isLoggedIn: isUserLoggedIn( state ),
		};
	},
	{
		followTag: requestFollowTag,
		recordReaderTracksEvent,
		unfollowTag: requestUnfollowTag,
	}
)( localize( TagStream ) );
