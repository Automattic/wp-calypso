/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */

import TestingG2 from './main';

export function show( context, next ) {
	context.primary = <TestingG2 />;
	next();
}
