import { createElement } from 'react';
import SiteSettingsReading from './main';

export function reading( context, next ) {
	context.primary = createElement( SiteSettingsReading );
	next();
}
