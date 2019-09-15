/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { addFilter } from '@wordpress/hooks';
import { mapValues, unescape, pick } from 'lodash';

/**
 * Internal dependencies
 */
import './editor.scss';

/*
 * This is a workaround for the way Gutenberg autocomplete works. It only looks for
 * beginnings of words and something like "teamabcp2" won't be found if you search "abc".
 * Adding spaces around the word solves the problem.
 */
const COMMON_PREFIXES = /(team|a8c|woo|happiness)/i;
const stripCommonWords = str => str.replace( COMMON_PREFIXES, ' ' );

const p2s = apiFetch( {
	path: '/internal/P2s?current_blog=' + window._currentSiteId + '&get_most_used=true',
} ).then( result => {
	result.list = mapValues( result.list, ( p2, subdomain ) => {
		const keywords = [ subdomain ];
		const stripped = stripCommonWords( subdomain );
		if ( subdomain !== stripped ) {
			keywords.push( stripped );
		}
		return {
			...p2,
			subdomain,
			keywords,
		};
	} );

	const popular = result.most_used ? Object.keys( result.most_used ) : [];
	return {
		all: Object.values( result.list ),
		popular: popular.length > 0 ? Object.values( pick( result.list, popular ) ) : false,
	};
} );

const p2Completer = {
	name: 'p2s',
	triggerPrefix: '+',
	options: search => {
		return p2s.then( lists => {
			if ( lists.popular && search === '' ) {
				return lists.popular;
			}
			return lists.all;
		} );
	},
	getOptionKeywords: site => site.keywords,
	getOptionLabel: site => (
		<div className="p2-autocomplete">
			<span className="p2-autocomplete__subdomain">+{ site.subdomain }</span>
			<span className="p2-autocomplete__title">{ unescape( site.title ) }</span>
			{ site.blavatar ? (
				<img
					src={ `${ site.blavatar }?s=20` }
					srcset={ `${ site.blavatar }?s=20 1x, ${ site.blavatar }?s=40 2x` }
					width="20"
					height="20"
					className="p2-autocomplete__blavatar"
					alt=""
				/>
			) : (
				<span className="p2-autocomplete__blavatar-placeholder" />
			) }
		</div>
	),
	getOptionCompletion: site => `+${ site.subdomain }`,
	isDebounced: true,
};

// Register autocompleter for all blocks
addFilter( 'editor.Autocomplete.completers', 'a8c/autocompleters/p2s', completers => [
	...completers,
	p2Completer,
] );
