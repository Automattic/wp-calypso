import { createElement } from 'react';
import SiteSettingsPerformance from './main';

export function performance( context, next ) {
	context.primary = createElement( SiteSettingsPerformance );
	next();
}
