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
			<WebPreviewContent
				previewUrl={ `https://${ context.params.site }/?iframe=true&preview=true` }
				showClose={ false }
			/>
		);
		next();
	},
};
