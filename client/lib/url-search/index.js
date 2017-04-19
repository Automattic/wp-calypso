/**
 * External dependencies
 */
import React from 'react';
import debugModule from 'debug';
import page from 'page';

/**
 * Internal dependencies
 */
import buildUrl from 'lib/mixins/url-search/build-url';

const debug = debugModule( 'calypso:url-search' );

const UrlSearch = Component => class extends Component {
	static displayName = Component.displayName || Component.name || '';

	state = {
		searchOpen: false
	};

	componentWillReceiveProps = ( { search } ) => ! search && this.setState( { searchOpen: false } );

	doSearch = ( keywords ) => {
		this.setState( {
			searchOpen: ( false !== keywords )
		} );

		if ( this.onSearch ) {
			this.onSearch( keywords );
			return;
		}

		const searchURL = buildUrl( window.location.href, keywords );

		debug( 'search posts for:', keywords );
		if ( this.props.search && keywords ) {
			debug( 'replacing URL: ' + searchURL );
			page.replace( searchURL );
		} else {
			debug( 'setting URL: ' + searchURL );
			page( searchURL );
		}
	};

	getSearchOpen = () => {
		return ( this.state.searchOpen !== false || this.props.search );
	}

	render() {
		return (
			<Component
				{ ...this.props }
				doSearch = { this.doSearch }
				getSearchOpen={ this.getSearch }
			/>
		);
	}
};

export default UrlSearch;
