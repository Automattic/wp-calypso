/**
 * External dependencies
 */
import { createElement } from 'react';
/**
 * Internal dependencies
 */
import ReauthRequired from './component';

export function reauthRequired( context, next ) {
	context.primary = createElement( ReauthRequired );
	next();
}
