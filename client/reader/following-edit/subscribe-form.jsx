//const debug = require( 'debug' )( 'calypso:reader:following:edit' );

// External dependencies
const React = require( 'react' ),
	url = require( 'url' ),
	noop = require( 'lodash/utility/noop' );

// Internal dependencies
const Search = require( 'components/search' ),
	FollowingEditSubscribeFormResult = require( './subscribe-form-result' ),
	FeedSubscriptionActions = require( 'lib/reader-feed-subscriptions/actions' ),
	Gridicon = require( 'components/gridicon' ),
	stats = require( 'reader/stats' );

const minSearchLength = 8; // includes protocol

var FollowingEditSubscribeForm = React.createClass( {

	propTypes: {
		onSearch: React.PropTypes.func,
		onSearchClose: React.PropTypes.func,
		onFollow: React.PropTypes.func,
		initialSearchString: React.PropTypes.string
	},

	getDefaultProps: function() {
		return {
			onSearch: noop,
			onSearchClose: noop,
			onFollow: noop,
			initialSearchString: ''
		}
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

	handleFollowIconClick: function() {
		this.refs.followingEditSubscriptionSearch.focus();
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

		return true;
	},

	blankSearch: function() {
		return ( <div className="following-edit__subscribe-form-blank">{ this.translate( 'Follow any site by adding its URL above.' ) }</div> );
	},

	render: function() {
		var searchResult = this.blankSearch(),
			handleFollowToggle = noop;

		const searchString = this.state.searchString,
			isWellFormedFeedUrl = this.state.isWellFormedFeedUrl,
			showSearchResult = ( searchString && searchString.length > minSearchLength );

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
				<Gridicon icon="add-outline" onClick={ this.handleFollowIconClick } />
				<Search
					isOpen={ true }
					key="newSubscriptionSearch"
					onSearch={ this.handleSearch }
					onSearchClose={ this.handleSearchClose }
					placeholder={ this.translate( 'Enter a site URL to follow', { context: 'field placeholder' } ) }
					delaySearch={ false }
					ref="followingEditSubscriptionSearch"
					onKeyDown={ this.handleKeyDown }
					disableAutocorrect={ true }
					initialValue={ this.props.initialSearchString }
				/>
				{ searchResult }
			</div>
		);
	}

} );

module.exports = FollowingEditSubscribeForm;
