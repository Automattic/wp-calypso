/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import url from 'url';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import SearchCard from 'components/search-card';
import FollowingEditSubscribeFormResult from './subscribe-form-result';
import FeedSubscriptionActions from 'lib/reader-feed-subscriptions/actions';

const minSearchLength = 8; // includes protocol

class FollowingEditSubscribeForm extends React.Component {
	static propTypes = {
		onSearch: React.PropTypes.func,
		onSearchClose: React.PropTypes.func,
		onFollow: React.PropTypes.func,
		initialSearchString: React.PropTypes.string,
		isSearchOpen: React.PropTypes.bool,
	};

	static defaultProps = {
		onSearch: noop,
		onSearchClose: noop,
		onFollow: noop,
		initialSearchString: '',
		isSearchOpen: false,
	};

	state = { searchString: this.props.initialSearchString };

	componentWillMount() {
		this.verifySearchString( this.props.initialSearchString );
	}

	focus = () => {
		this.refs.followingEditSubscriptionSearch.focus();
	};

	handleFollowToggle = () => {
		FeedSubscriptionActions.follow( this.state.searchString, true );
		this.setState( { previousSearchString: this.state.searchString } );

		// Clear the search field
		this.refs.followingEditSubscriptionSearch.clear();

		// Call onFollow method on the parent
		this.props.onFollow( this.state.searchString );
	};

	handleKeyDown = event => {
		// Use Enter to submit
		if (
			event.keyCode === 13 &&
			this.state.searchString.length > minSearchLength &&
			this.state.isWellFormedFeedUrl
		) {
			event.preventDefault();
			this.handleFollowToggle();
		}
	};

	handleSearch = searchString => {
		if ( searchString === this.state.searchString ) {
			return;
		}

		this.verifySearchString( searchString );
		this.props.onSearch( searchString );
	};

	handleSearchClose = () => {
		this.props.onSearchClose();
	};

	verifySearchString = searchString => {
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
			isWellFormedFeedUrl: isWellFormedFeedUrl,
		} );
	};

	isWellFormedFeedUrl = parsedUrl => {
		if ( ! parsedUrl.hostname || parsedUrl.hostname.indexOf( '.' ) === -1 ) {
			return false;
		}

		// Check for a valid-looking TLD
		if ( parsedUrl.hostname.lastIndexOf( '.' ) > parsedUrl.hostname.length - 3 ) {
			return false;
		}

		// Make sure the hostname has at least two parts separated by a dot
		const hostnameParts = parsedUrl.hostname.split( '.' ).filter( Boolean );
		if ( hostnameParts.length < 2 ) {
			return false;
		}

		return true;
	};

	render() {
		var searchResult = null, handleFollowToggle = noop;

		const searchString = this.state.searchString,
			isWellFormedFeedUrl = this.state.isWellFormedFeedUrl,
			showSearchResult = searchString && searchString.length > minSearchLength;

		// Activate the follow button if the URL looks reasonable
		if ( isWellFormedFeedUrl ) {
			handleFollowToggle = this.handleFollowToggle;
		}

		if ( showSearchResult ) {
			searchResult = (
				<FollowingEditSubscribeFormResult
					isValid={ isWellFormedFeedUrl }
					url={ searchString }
					onFollowToggle={ handleFollowToggle }
				/>
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
					placeholder={ this.props.translate( 'Enter a site URL to follow', {
						context: 'field placeholder',
					} ) }
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
}

export default localize( FollowingEditSubscribeForm );
