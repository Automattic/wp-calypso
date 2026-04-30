import page from '@automattic/calypso-router';
import debugFactory from 'debug';
import * as React from 'react';

const debug = debugFactory( 'calypso:url-search' );

/**
 * Function for constructing the url to page to. Here are some examples:
 * 1. { uri: 'google.com', search:'hello' } --> 'https://google.com/?s=hello'
 * 2. {
 * uri: 'wordpress.com/reader/search?q=reader+is+awesome',
 * search: 'reader is super awesome'
 * queryKey: 'q',
 * } --> result.searchParams.get( 'q' ) === 'reader is super awesome'
 * @param {Object} options the options object
 * @param {string} options.uri the base uri to modify and add a query to
 * @param {string} options.search the search term
 * @param {string} [options.queryKey] the key to place in the url.  defaults to s
 * @returns {URL} The built search url
 */
export const buildSearchUrl = ( { uri, search, queryKey = 's' } ) => {
	if ( ! uri.startsWith( 'http' ) ) {
		uri = 'https://' + uri;
	}
	const parsedUrl = new URL( uri );
	if ( search ) {
		// Note: spaces in the search term are automatically converted to +
		parsedUrl.searchParams.set( queryKey, search );
	} else {
		parsedUrl.searchParams.delete( queryKey );
	}
	return parsedUrl;
};

const UrlSearch = ( Component ) =>
	class extends React.Component {
		static displayName = `UrlSearch(${ Component.displayName || Component.name || '' })`;
		static defaultProps = {
			search: '',
			queryKey: 's',
		};

		state = {
			searchOpen: false,
		};

		UNSAFE_componentWillReceiveProps( { search } ) {
			return ! search && this.setState( { searchOpen: false } );
		}

		doSearch = ( query ) => {
			this.setState( {
				searchOpen: false !== query,
			} );

			const searchURL = buildSearchUrl( {
				uri: window.location.href,
				search: query,
				queryKey: this.props.queryKey,
			} );
			const pathSearch = searchURL.pathname + searchURL.search;

			debug( 'search for: %s', query );
			if ( this.props.search && query ) {
				debug( 'replacing URL: %s', pathSearch );
				page.replace( pathSearch );
			} else {
				debug( 'setting URL: %s', pathSearch );
				page( pathSearch );
			}
		};

		getSearchOpen = () => {
			return this.state.searchOpen !== false || !! this.props.search;
		};

		render() {
			return (
				<Component
					{ ...this.props }
					doSearch={ this.doSearch }
					getSearchOpen={ this.getSearchOpen }
				/>
			);
		}
	};

export default UrlSearch;
