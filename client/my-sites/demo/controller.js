/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { renderPage } from 'lib/react-helpers';
import Main from './main';

export default function controller( context ) {
	renderPage( context, <Main /> );
}
