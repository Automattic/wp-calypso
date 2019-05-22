/** @format */

/**
 * External dependencies
 */
import { createElement } from 'react';

/**
 * Internal Dependencies
 */
import HireAProView from './view';

export const layout = ( context, next ) => {
	const { contentComponent, path } = context;

	context.primary = createElement( HireAProView, { contentComponent, path } );

	next();
};
