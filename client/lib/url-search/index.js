/**
 * External dependencies
 */
import React from 'react';
import debugModule from 'debug';
import page from 'page';
import url from 'url';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
const debug = debugModule( 'calypso:url-search' );

/**
 * Function for constructing the url to page to. e.g.
 * { uri: 'google.com', search:'hello' } --> 'google.com?s=hello'
 *
 * @param {Object} options the options object
 * @param {string} options.uri the base uri to modify and add a query to
 * @param {string} options.search the search term
 * @param {string} [options.queryKey = s] the key to place in the url.  defaults to s
 *
 * @returns {string} The built search url
 */
const buildSearchUrl = ( { uri, search, queryKey = 's' } ) => {
	const parsedUrl = pick(
		url.parse( uri, true ),
		'pathname',
		'hash',
		'query',
	);

	if ( search ) {
		parsedUrl.query[ queryKey ] = search;
	} else {
		delete parsedUrl.query[ queryKey ];
	}

	return url.format( parsedUrl ).replace( /\%20/g, '+' );
};

const UrlSearch = Component => class extends Component {
	static displayName = Component.displayName || Component.name || '';

	state = {
		searchOpen: false
	};

	componentWillReceiveProps = ( { search } ) => ! search && this.setState( { searchOpen: false } );

	doSearch = ( query ) => {
		this.setState( {
			searchOpen: ( false !== query )
		} );

		if ( this.onSearch ) {
			this.onSearch( query );
			return;
		}

		const searchURL = buildSearchUrl( {
			uri: window.location.href,
			search: query,
			queryKey: this.props.queryKey
		} );

		debug( 'search for:', query );
		if ( this.props.search && query ) {
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
