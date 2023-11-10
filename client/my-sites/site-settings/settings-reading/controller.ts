import { Callback } from '@automattic/calypso-router';
import { createElement } from 'react';
import ReadingSettings from './main';

export const createReadingSettings: Callback = ( context, next ) => {
	context.primary = createElement( ReadingSettings );
	next();
};
