/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

export default async () => ( {
	name: 'xpost',
	className: 'autocompleters__xpost',
	triggerPrefix: '+',
	options: await new Promise( ( resolve, reject ) => {
		wpcom.req.get(
			{
				path: '/internal/P2s',
				apiVersion: '1.1',
			},
			( error, result ) => {
				if ( error ) return reject( error );

				return resolve(
					Object.entries( result.list ).map( ( [ subdomain, p2 ] ) => ( {
						...p2,
						subdomain,
					} ) )
				);
			}
		);
	} ),
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
