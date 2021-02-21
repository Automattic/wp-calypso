/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import PreviewMain from './main';

export function preview( context, next ) {
	context.primary = (
		<PreviewMain
			site={ context.params.site }
			help={ typeof context.query.help !== 'undefined' }
			checklist={ typeof context.query.checklist !== 'undefined' }
		/>
	);
	next();
}
