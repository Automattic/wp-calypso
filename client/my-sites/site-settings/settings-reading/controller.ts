import { Callback } from 'page';
import { createElement } from 'react';
import ReadingSettings from './main';

export const createReadingSettings: Callback = ( context, next ) => {
	context.primary = createElement( ReadingSettings );
	next();
};
