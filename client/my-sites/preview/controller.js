/**
 * External dependencies
 */
// import ReactDom from 'react-dom';
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
// import WebPreview from 'components/web-preview';

let initialLoad;

export default {
	preview: function( context, next ) {
		if ( initialLoad ) {
			initialLoad = false;
			window.addEventListener( 'message', ( e ) => {
				try {
					const data = JSON.parse( e.data );
					if ( data.channel === 'preview' ) {
						switch ( data.type ) {
							case 'link':
								page( data.payload.replace( 'https://wordpress.com', '' ) );
								return;
						}
					}
				} catch ( err ) {}
			} );
		}

		context.primary = (
			<div>
				<iframe
					width="100%"
					height="600"
					src={ `https://${ context.params.site }/?iframe=true&preview=true` }
				/>
			</div>
		);
		next();
	},
};
