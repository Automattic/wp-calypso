/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */

import ChecklistMain from './main';

export function show( context, next ) {
	const displayMode = get( context, 'query.d' );
	context.primary = <ChecklistMain displayMode={ displayMode } />;
	next();
}
