/**
 * External dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:url-search' );
import page from 'page';

/**
 * Internal dependencies
 */
import buildUrl from 'lib/build-url';

module.exports = {

	getInitialState: function() {
		return {
			searchOpen: false
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( ! nextProps.search ) {
			this.setState( {
				searchOpen: false
			} );
		}
	},

	doSearch: function( keywords ) {
		let searchURL;

		this.setState( {
			searchOpen: ( false !== keywords )
		} );

		if ( this.onSearch ) {
			this.onSearch( keywords );
			return;
		}

		searchURL = buildUrl( window.location.href, keywords );

		debug( 'search posts for:', keywords );
		if ( this.props.search && keywords ) {
			debug( 'replacing URL: ' + searchURL );
			page.replace( searchURL );
		} else {
			debug( 'setting URL: ' + searchURL );
			page( searchURL );
		}
	},

	getSearchOpen: function() {
		return ( this.state.searchOpen !== false || this.props.search );
	}

};
