/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import WebPreviewContent from 'components/web-preview/content';

export default {
	preview: function( context, next ) {
		context.primary = (
			<div style={ { height: '100%' } }>
				<WebPreviewContent
					previewUrl={ `https://${ context.params.site }/?iframe=true&preview=true` }
					showClose={ false }
					loadingMessage="Beep beep poop…"
				/>
			</div>
		);
		next();
	},
};
