/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { addFilter } from '@wordpress/hooks';
import { reduce, unescape, isArray } from 'lodash';

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
	const shouldCheckPopular = isArray( result.most_used );
	return reduce(
		result.list,
		( autocomplete, p2, subdomain ) => {
			// Construct object for autocomplete.
			const item = {
				...p2,
				subdomain,
				keywords: [ subdomain ],
			};

			// Generate keyword variants for easier searching.
			const stripped = stripCommonWords( subdomain );
			if ( subdomain !== stripped ) {
				item.keywords.push( stripped );
			}

			// Build popular list.
			if ( shouldCheckPopular && result.most_used.indexOf( subdomain ) > -1 ) {
				autocomplete.popular.push( item );
			}

			// Add to the full list.
			autocomplete.all.push( item );

			return autocomplete;
		},
		{
			all: [],
			popular: [],
		}
	);
} );

const p2Completer = {
	name: 'p2s',
	triggerPrefix: '+',
	options: search => {
		return p2s.then( lists => {
			if ( lists.popular.length > 0 && search === '' ) {
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
};

// Register autocompleter for all blocks
addFilter( 'editor.Autocomplete.completers', 'a8c/autocompleters/p2s', completers => [
	...completers,
	p2Completer,
] );
