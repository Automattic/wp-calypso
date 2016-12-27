// External dependencies
const React = require( 'react' ),
	url = require( 'url' ),
	noop = require( 'lodash/noop' );

// Internal dependencies
const SearchCard = require( 'components/search-card' ),
	FollowingEditSubscribeFormResult = require( './subscribe-form-result' ),
	FeedSubscriptionActions = require( 'lib/reader-feed-subscriptions/actions' );

const minSearchLength = 8; // includes protocol

import { connect } from 'react-redux';
import QueryFeedSearch from 'components/data/query-reader-feeds-search';
import { getFeedsForQuery } from 'state/reader/feed-search/selectors';

import Title from 'reader/list-item/title';
import ListItem from 'reader/list-item';
import Actions from 'reader/list-item/actions';
import FollowButton from 'blocks/follow-button/button';
import Description from 'reader/list-item/description';
import Icon from 'reader/list-item/icon';
import SiteIcon from 'components/site-icon';

function FeedSearchResults( { feeds, } ) {
	if ( ! feeds ) {
		return null;
	}

	const handleFollow = feed => () => FeedSubscriptionActions.follow( feed.URL, true );

	const feedItems = feeds.map(
		feed => (
			<ListItem className={ 'is-search-result' } key={ feed.URL + feed.score }>
				<Icon><SiteIcon size={ 48 } /></Icon>
				<Title>{ feed.URL }</Title>
				<Description>{ feed.title }</Description>
				<Actions>
					<FollowButton disabled={ false } following={ false } onFollowToggle={ handleFollow( feed ) } />
				</Actions>
			</ListItem>
		)
	);

	return ( <ul>
		{ feedItems }
	</ul> );
}

const ConnectedFeedSearchResults = connect(
	( state, ownProps ) => (
		{
			feeds: getFeedsForQuery( state, ownProps.query )
		}
	),
	null,
)( FeedSearchResults );

var FollowingEditSubscribeForm = React.createClass( {

	propTypes: {
		onSearch: React.PropTypes.func,
		onSearchClose: React.PropTypes.func,
		onFollow: React.PropTypes.func,
		initialSearchString: React.PropTypes.string,
		isSearchOpen: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			onSearch: noop,
			onSearchClose: noop,
			onFollow: noop,
			initialSearchString: '',
			isSearchOpen: false
		};
	},

	getInitialState: function() {
		return { searchString: this.props.initialSearchString };
	},

	componentWillMount: function() {
		this.verifySearchString( this.props.initialSearchString );
	},

	focus: function() {
		this.refs.followingEditSubscriptionSearch.focus();
	},

	handleFollowToggle: function() {
		FeedSubscriptionActions.follow( this.state.searchString, true );
		this.setState( { previousSearchString: this.state.searchString } );

		// Clear the search field
		this.refs.followingEditSubscriptionSearch.clear();

		// Call onFollow method on the parent
		this.props.onFollow( this.state.searchString );
	},

	handleKeyDown: function( event ) {
		// Use Enter to submit
		if ( event.keyCode === 13 && this.state.searchString.length > minSearchLength && this.state.isWellFormedFeedUrl ) {
			event.preventDefault();
			this.handleFollowToggle();
		}
	},

	handleSearch: function( searchString ) {
		if ( searchString === this.state.searchString ) {
			return;
		}

		this.verifySearchString( searchString );
		this.props.onSearch( searchString );
	},

	handleSearchClose: function() {
		this.props.onSearchClose();
	},

	verifySearchString: function( searchString ) {
		let parsedUrl = url.parse( searchString );

		// Make sure the feed URL has http:// protocol
		if ( ! parsedUrl.protocol ) {
			searchString = 'http://' + searchString;
			parsedUrl = url.parse( searchString );
		}

		// Check if the feed URL appears to be in loosely the correct format
		let isWellFormedFeedUrl = null;

		if ( parsedUrl.href && parsedUrl.href.length >= minSearchLength ) {
			isWellFormedFeedUrl = this.isWellFormedFeedUrl( parsedUrl );
		}

		this.setState( {
			searchString: searchString,
			isWellFormedFeedUrl: isWellFormedFeedUrl
		} );
	},

	isWellFormedFeedUrl: function( parsedUrl ) {
		if ( ! parsedUrl.hostname || parsedUrl.hostname.indexOf( '.' ) === -1 ) {
			return false;
		}

		// Check for a valid-looking TLD
		if ( parsedUrl.hostname.lastIndexOf( '.' ) > ( parsedUrl.hostname.length - 3 ) ) {
			return false;
		}

		// Make sure the hostname has at least two parts separated by a dot
		const hostnameParts = parsedUrl.hostname.split( '.' ).filter( Boolean );
		if ( hostnameParts.length < 2 ) {
			return false;
		}

		return true;
	},

	render: function() {
		var searchResult = null,
			handleFollowToggle = noop;

		const searchString = this.state.searchString,
			isWellFormedFeedUrl = this.state.isWellFormedFeedUrl,
			showSearchResult = ( searchString && searchString.length > minSearchLength );

		const feedQuery = searchString.substring( 6 );
		// Activate the follow button if the URL looks reasonable
		if ( isWellFormedFeedUrl ) {
			handleFollowToggle = this.handleFollowToggle;
		}

		if ( showSearchResult ) {
			searchResult = ( <FollowingEditSubscribeFormResult
				isValid={ isWellFormedFeedUrl }
				url={ searchString }
				onFollowToggle={ handleFollowToggle } />
			);
		}

		return (
			<div className="following-edit__subscribe-form">
				<QueryFeedSearch query={ feedQuery } />
				<SearchCard
					isOpen={ this.props.isSearchOpen }
					autoFocus={ true }
					key="newSubscriptionSearch"
					onSearch={ this.handleSearch }
					onSearchClose={ this.handleSearchClose }
					placeholder={ this.translate( 'Enter a search or site URL to follow', { context: 'field placeholder' } ) }
					delaySearch={ false }
					ref="followingEditSubscriptionSearch"
					onKeyDown={ this.handleKeyDown }
					disableAutocorrect={ true }
					initialValue={ this.props.initialSearchString }
				/>
				{ searchResult }
				<ConnectedFeedSearchResults query={ feedQuery } />
			</div>
		);
	}

} );

module.exports = FollowingEditSubscribeForm;
