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
	getOptionLabel( p2 ) {
		return [
			<span key="url" className="autocompleters__xpost-site-url">
				+{ p2.subdomain }
			</span>,
			<span key="name" className="autocompleters__xpost-site-name">
				{ p2.title }
			</span>,
			<img
				key="avatar"
				className="autocompleters__xpost-site-avatar"
				alt=""
				height="24"
				width="24"
				src={ p2.blavatar }
			/>,
		];
	},
	getOptionCompletion( site ) {
		return `+${ site.subdomain }`;
	},
} );
