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

const p2s = apiFetch( {
	path: '/internal/P2s',
} ).then( result =>
	map( result.list, ( p2, subdomain ) => {
		const keywords = [ subdomain ];
		/*
		 * This is a workaround for the way Gutenberg autocomplete works. It looks for
		 * beginnings of words and something like "teamabcp2" won't be found if you search "abc".
		 * Adding spaces around the word solves the problem.
		 */
		if ( subdomain.indexOf( 'team' ) > -1 ) {
			keywords.push( subdomain.replace( 'team', ' team ' ) );
		}
		return {
			...p2,
			subdomain,
			keywords,
		};
	} )
);

const p2Completer = {
	name: 'p2s',
	triggerPrefix: '+',
	options: p2s,
	getOptionKeywords: site => site.keywords,
	getOptionLabel: site => (
		<div className="p2-autocomplete">
			<span key="subdomain" className="p2-autocomplete__subdomain">
				+{ site.subdomain }
			</span>
			<span key="description" className="p2-autocomplete__title">
				{ unescape( site.title ) }
			</span>
			{ site.blavatar ? (
				<img
					key="blavatar"
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
