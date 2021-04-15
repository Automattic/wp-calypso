/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

export default () => ( {
	name: 'xpost',
	className: 'autocompleters__xpost',
	triggerPrefix: '+',
	/**
	 * The autocompleter will pass `options` to `Promise.resolve` so we can safely assign this to a promise that
	 * will eventually resolve and can just be used over and over again, instead of caching the result manually
	 *
	 * @see https://github.com/WordPress/gutenberg/blob/a947375ea7df8e2257fecedeea5f323ebffa38f6/packages/components/src/autocomplete/index.js#L171
	 */
	options: wpcom.req
		.get( {
			path: '/internal/P2s',
			apiVersion: '1.1',
		} )
		.then( ( result ) =>
			Object.entries( result.list ).map( ( [ subdomain, p2 ] ) => ( {
				...p2,
				subdomain,
			} ) )
		),
	getOptionKeywords( p2 ) {
		return [ p2.title, p2.subdomain ];
	},
	getOptionLabel( site ) {
		const { subdomain, title, blavatar } = site;
		const url = blavatar.replace( /.*?src=["'](.*?)["'].*/, '$1' );

		return [
			<span key="slug" className="editor-autocompleters__site-slug">
				+{ subdomain }
			</span>,
			<span key="name" className="editor-autocompleters__site-name">
				{ title }{ ' ' }
				<img
					key="blavatar"
					className="editor-autocompleters__site-blavatar"
					alt={ title }
					src={ url }
				/>
			</span>,
		];
	},
	getOptionCompletion( site ) {
		return `+${ site.subdomain }`;
	},
} );
