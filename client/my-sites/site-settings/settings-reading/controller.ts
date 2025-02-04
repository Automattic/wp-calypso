import { createElement } from 'react';
import ReadingSettings from './main';
import type { Callback } from '@automattic/calypso-router';

export const createReadingSettings: Callback = ( context, next ) => {
	context.primary = createElement( ReadingSettings );
	next();
};
