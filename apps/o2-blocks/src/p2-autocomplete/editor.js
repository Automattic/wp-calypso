/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { addFilter } from '@wordpress/hooks';
import { map, unescape } from 'lodash';

/**
 * Internal dependencies
 */
import './editor.scss';

function substrings( name, subs = [ name ] ) {
	if ( name.length === 0 ) {
		return subs;
	}

	const [ , ...t ] = [ ...name ]; // don't accidentally split characters
	const next = t.join( '' );

	subs.push( next );

	return substrings( next, subs );
}

const p2s = apiFetch( {
	path: '/internal/P2s',
} ).then( result =>
	map( result.list, ( p2, subdomain ) => ( {
		...p2,
		subdomain,
		keywords: substrings( subdomain ),
	} ) )
);

const p2Completer = {
	name: 'p2s',
	triggerPrefix: '+',
	options: p2s,
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
