/**
 * External Dependencies
 *
 * @format
 */

import React from 'react';

/**
 * Internal Dependencies
 */

import ChecklistShow from '../checklist-show';

export function show( context, next ) {
	context.primary = <ChecklistShow />;
	next();
}
