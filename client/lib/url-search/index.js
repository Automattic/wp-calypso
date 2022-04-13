// eslint-disable-next-line no-restricted-imports
import url from 'url'; //TODO: fix this restricted import
import debugFactory from 'debug';
import { pick } from 'lodash';
import page from 'page';
import * as React from 'react';

const debug = debugFactory( 'calypso:url-search' );

/**
 * Function for constructing the url to page to. Here are some examples:
 * 1. { uri: 'google.com', search:'hello' } --> 'google.com?s=hello'
 * 2. {
 *     uri: 'wordpress.com/read/search?q=reader+is+awesome',
 *     search: 'reader is super awesome'
 *     queryKey: 'q',
 *    } --> 'wordpress.com/read/search?q=reader+is+super+awesome'
 *
 * @param {object} options the options object
 * @param {string} options.uri the base uri to modify and add a query to
 * @param {string} options.search the search term
 * @param {string} [options.queryKey = s] the key to place in the url.  defaults to s
 *
 * @returns {string} The built search url
 */
export const buildSearchUrl = ( { uri, search, queryKey = 's' }, extraParams = {} ) => {
	const parsedUrl = pick( url.parse( uri, true ), 'pathname', 'hash', 'query' );

	if ( search ) {
		parsedUrl.query[ queryKey ] = search;
	} else {
		delete parsedUrl.query[ queryKey ];
	}

	Object.keys( extraParams ).forEach( ( extraParamKey ) => {
		parsedUrl.query[ extraParamKey ] = extraParams[ extraParamKey ];
	} );

	return url.format( parsedUrl ).replace( /%20/g, '+' );
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

		doSearch = ( query, extraParams = {} ) => {
			this.setState( {
				searchOpen: false !== query,
			} );

			const searchURL = buildSearchUrl(
				{
					uri: window.location.href,
					search: query,
					queryKey: this.props.queryKey,
				},
				extraParams
			);

			debug( 'search for: %s', query );
			if ( this.props.search && query ) {
				debug( 'replacing URL: %s', searchURL );
				page.replace( searchURL );
			} else {
				debug( 'setting URL: %s', searchURL );
				page( searchURL );
			}
		};

		getSearchOpen = () => {
			return this.state.searchOpen !== false || !! this.props.search;
		};

		render() {
			return (
				<Component
					{ ...this.props }
					queryParams={ url.parse( this.props.path, true ).query }
					doSearch={ this.doSearch }
					getSearchOpen={ this.getSearchOpen }
				/>
			);
		}
	};

export default UrlSearch;
