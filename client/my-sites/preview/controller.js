/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { once } from 'lodash';

/**
 * Internal dependencies
 */
import WebPreviewContent from 'components/web-preview/content';

const ensureRoutingOnFrameMessage = once( () => {
	window.addEventListener( 'message', ( event ) => {
		try {
			const data = JSON.parse( event.data );
			if ( data.channel !== 'preview-asdf123' ) {
				return;
			}

			switch ( data.type ) {
				case 'link':
					page( data.payload.replace( 'https://wordpress.com', '' ) );
					return;
			}
		} catch ( err ) {}
	} );
} );

export default {
	preview: function( context, next ) {
		ensureRoutingOnFrameMessage();
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
