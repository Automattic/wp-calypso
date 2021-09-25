import React from 'react';
import SiteSettingsPerformance from './main';

export function performance( context, next ) {
	context.primary = React.createElement( SiteSettingsPerformance );
	next();
}
