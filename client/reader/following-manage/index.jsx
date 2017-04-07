/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { trim, debounce, sampleSize, map } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import qs from 'qs';
import { List, WindowScroller } from 'react-virtualized';

/**
 * Internal Dependencies
 */
import CompactCard from 'components/card/compact';
import DocumentHead from 'components/data/document-head';
import RecommendedPosts from 'reader/stream/recommended-posts';
import HeaderBack from 'reader/header-back';
import SearchInput from 'components/search';
import ReaderMain from 'components/reader-main';
import SubscriptionListItem from 'blocks/reader-subscription-list-item/';
import { getReaderFollows, getReaderFeedsForQuery } from 'state/selectors';
import QueryReaderFollows from 'components/data/query-reader-follows';
import QueryReaderFeedsSearch from 'components/data/query-reader-feeds-search';
import feedSiteFluxAdapter from 'lib/reader-post-flux-adapter';
// import { recordTrackForPost, recordAction, recordTrack } from 'reader/stats';
// import { } from 'reader/follow-button/follow-sources';
// TODO add stats

const ConnectedFollowListItem = localize( feedSiteFluxAdapter(
	( { feed, site, translate, url, feedId, siteId } ) => (
		<SubscriptionListItem
			isFollowing={ true }
			siteUrl={ url }
			siteTitle={ feed && feed.name }
			siteAuthor={ site && site.owner }
			siteExcerpt={ feed && feed.description }
			translate={ translate }
			feedId={ feedId }
			siteId={ siteId }
			site={ site }
			feed={ feed }
		/>
	)
) );

class FollowingManage extends Component {
	static propTypes = {
		query: React.PropTypes.string,
	};

	// TODO make this common between our different search pages?
	updateQuery = ( newValue ) => {
		this.scrollToTop();
		const trimmedValue = trim( newValue ).substring( 0, 1024 );
		if ( ( trimmedValue !== '' &&
				trimmedValue.length > 1 &&
				trimmedValue !== this.props.query
			) ||
			newValue === ''
		) {
			let searchUrl = '/following/manage';
			if ( newValue ) {
				searchUrl += '?' + qs.stringify( { q: newValue } );
			}
			page.replace( searchUrl );
		}
	}

	scrollToTop = () => {
		window.scrollTo( 0, 0 );
	}

	handleStreamMounted = ( ref ) => {
		this.streamRef = ref;
	}

	handleSearchBoxMounted = ( ref ) => {
		this.searchBoxRef = ref;
	}

	resizeSearchBox = () => {
		if ( this.searchBoxRef && this.streamRef ) {
			const width = this.streamRef.getClientRects()[ 0 ].width;
			if ( width > 0 ) {
				this.searchBoxRef.style.width = `${ width }px`;
			}
			this.setState( { width } );
		}
	}

	componentDidMount() {
		this.resizeListener = window.addEventListener(
			'resize',
			debounce( this.resizeSearchBox, 50 )
		);
		this.resizeSearchBox();

		this.props.recommendationsStore.on( 'change', this.updateState );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.resizeListener );
		this.props.recommendationsStore.off( 'change', this.updateState );
	}

	state = this.getStateFromStores();

	updateState = ( store ) => {
		this.setState( this.getStateFromStores( store ) );
	}

	getStateFromStores() {
		const { recommendationsStore } = this.props;
		let recommendations = ( this.state && this.state.recommendations ) || [];

		if ( recommendations.length === 0 ) {
			recommendations = sampleSize( recommendationsStore.get(), 2 );
		}

		return {
			recommendations,
			width: ( this.state && this.state.width ) || 800,
		};
	}

	followedRowRenderer = ( { index, key, style } ) => {
		const { follows } = this.props;
		const follow = follows[ index ];
		return (
			<div key={ key } style={ style }>
				<ConnectedFollowListItem
					feedId={ follow.feed_ID }
					siteId={ follow.blog_ID }
					url={ follow.URL }
				/>
			</div>
		);
	};

	render() {
		const { query, translate, follows, searchResults } = this.props;
		const searchPlaceholderText = translate( 'Search millions of sites' );
		const recommendations = this.state.recommendations;

		return (
			<ReaderMain className="following-manage">
				<DocumentHead title={ 'Manage Following' } />
				{ this.props.showBack && <HeaderBack /> }
				{ follows.length === 0 && <QueryReaderFollows /> }
				{ searchResults.length === 0 && <QueryReaderFeedsSearch query={ query } /> }
				<h1 className="following-manage__header"> { translate( 'Follow Something New' ) } </h1>
				<div ref={ this.handleStreamMounted } />
				<div className="following-manage__fixed-area" ref={ this.handleSearchBoxMounted }>
					<CompactCard className="following-manage__input-card">
						<SearchInput
							onSearch={ this.updateQuery }
							onSearchClose={ this.scrollToTop }
							autoFocus={ this.props.autoFocusInput }
							delaySearch={ true }
							delayTimeout={ 500 }
							placeholder={ searchPlaceholderText }
							initialValue={ query }
							value={ query }>
						</SearchInput>
					</CompactCard>
				</div>
				{ ! query && <RecommendedPosts recommendations={ recommendations } /> }
				{ ! query &&
					<WindowScroller>
						{ ( { height, scrollTop } ) => (
							<List
								autoHeight
								height={ height }
								rowCount={ follows.length }
								rowHeight={ 83 }
								rowRenderer={ this.followedRowRenderer }
								scrollTop={ scrollTop }
								width={ this.state.width }
							/>
						)}
					</WindowScroller>
				}
				{ !! query && map( searchResults, feed =>
					<ConnectedFollowListItem
						key={ `feedresult-${ feed.URL }` }
						url={ feed.URL }
						feedId={ feed.feed_ID }
						siteId={ feed.blog_ID }
					/> // todo transform from feed_ID to feedId in data-layer??
				) }
			</ReaderMain>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		follows: getReaderFollows( state ),
		searchResults: getReaderFeedsForQuery( state, ownProps.query ) || [],
	} ),
)(	localize( FollowingManage ) );
