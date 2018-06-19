/**
 * External Dependencies
 *
 * @format
 */

import React from 'react';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */

import ChecklistShow from '../checklist-show';

export function show( context, next ) {
	const displayMode = get( context, 'query.d' );
	context.primary = <ChecklistShow displayMode={ displayMode } />;
	next();
}
