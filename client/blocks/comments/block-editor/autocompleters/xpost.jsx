/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

let results;
let request;

export default {
	name: 'xpost',
	className: 'autocompleters__xpost',
	triggerPrefix: '+',
	async options() {
		if ( results ) {
			// if we've already gotten results, use them instead of requesting new ones
			return results;
		}

		if ( request ) {
			// if a request is already underway, use the results from that
			return await request;
		}

		// otherwise make a new request
		request = wpcom.req
			.get( {
				path: '/internal/P2s',
				apiVersion: '1.1',
			} )
			.then( ( result ) =>
				Object.entries( result.list ).map( ( [ subdomain, p2 ] ) => ( {
					...p2,
					subdomain,
				} ) )
			);

		// cache the results
		results = await request;

		return results;
	},
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
};
