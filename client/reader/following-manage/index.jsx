/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { trim, debounce } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import qs from 'qs';
import { List, WindowScroller } from 'react-virtualized';

/**
 * Internal Dependencies
 */
import CompactCard from 'components/card/compact';
import DocumentHead from 'components/data/document-head';
import HeaderBack from 'reader/header-back';
import SearchInput from 'components/search';
import ReaderMain from 'components/reader-main';
import { getReaderFeedsForQuery } from 'state/selectors';
import QueryReaderFeedsSearch from 'components/data/query-reader-feeds-search';
import ConnectedSubscriptionListItem from './connected-subscription-list-item';
import FollowingManageSubscriptions from './subscriptions';

class FollowingManage extends Component {
	static propTypes = {
		query: React.PropTypes.string,
	};
	state = { width: 800 };

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
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.resizeListener );
	}

	searchResultRowRenderer = ( { index, key, style } ) => {
		const { searchResults } = this.props;
		const feed = searchResults[ index ];
		return (
			<div key={ key } style={ style }>
					<ConnectedSubscriptionListItem
						key={ `feedresult-${ feed.URL }` }
						url={ feed.URL }
						feedId={ +feed.feed_ID }
						siteId={ +feed.blog_ID }
					/>
			</div>
		);
	};

	render() {
		const { query, translate, searchResults } = this.props;
		const searchPlaceholderText = translate( 'Search millions of sites' );

		return (
			<ReaderMain className="following-manage">
				<DocumentHead title={ 'Manage Following' } />
				{ this.props.showBack && <HeaderBack /> }
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
				{ !! query &&
					<WindowScroller>
						{ ( { height, scrollTop } ) => (
							<List
								autoHeight
								height={ height }
								rowCount={ searchResults.length }
								rowHeight={ 83 }
								rowRenderer={ this.searchResultRowRenderer }
								scrollTop={ scrollTop }
								width={ this.state.width }
							/>
						)}
					</WindowScroller>
				}
				<FollowingManageSubscriptions />
			</ReaderMain>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		searchResults: getReaderFeedsForQuery( state, ownProps.query ) || [],
	} ),
)( localize( FollowingManage ) );
