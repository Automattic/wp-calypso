/**
 * External Dependencies
 *
 * @format
 */

import React from 'react';

/**
 * Internal Dependencies
 */

import { renderWithReduxStore } from 'lib/react-helpers';
import ChecklistShow from '../checklist-show';

export function show( context ) {
	renderWithReduxStore( <ChecklistShow />, 'primary', context.store );
}
