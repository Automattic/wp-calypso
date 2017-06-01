/**
 * External dependencies
 */
// import ReactDom from 'react-dom';
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import WebPreviewContent from 'components/web-preview/content';

let initialLoad = true;

export default {
	preview: function( context, next ) {
		if ( initialLoad ) {
			initialLoad = false;
			window.addEventListener( 'message', ( e ) => {
				try {
					const data = JSON.parse( e.data );
					if ( data.channel === 'preview-asdf123' ) {
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
			<div style={ { height: '100%' } }>
				<WebPreviewContent
					previewUrl={ `https://${ context.params.site }/?iframe=true&preview=true&calypso_token=asdf123` }
					showClose={ false }
					loadingMessage="Beep beep poop…"
				/>
			</div>
		);
		next();
	},
};
