/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { unescape } from 'lodash';

/**
 * Internal dependencies
 */
import p2Store from './store';
import './editor.scss';

const p2Completer = {
	name: 'p2s',
	triggerPrefix: '+',
	options: search => p2Store.getState().getP2s( search ),
	getOptionKeywords: site => [ site.subdomain, site.title ],
	getOptionLabel: site => (
		<div className="p2-autocomplete">
			<span key="subdomain" className="p2-autocomplete__subdomain">
				+{ site.subdomain }
			</span>
			<span key="description" className="p2-autocomplete__description">
				{ unescape( site.description ) }
			</span>
			{ site.blavatar ? (
				<img
					key="blavatar"
					src={ site.blavatar }
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
