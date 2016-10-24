// External dependencies
const React = require( 'react' ),
	url = require( 'url' ),
	noop = require( 'lodash/noop' );

// Internal dependencies
const SearchCard = require( 'components/search-card' ),
	FollowingEditSubscribeFormResult = require( './subscribe-form-result' ),
	FeedSubscriptionActions = require( 'lib/reader-feed-subscriptions/actions' );

const minSearchLength = 8; // includes protocol

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
				<SearchCard
					isOpen={ this.props.isSearchOpen }
					autoFocus={ true }
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
