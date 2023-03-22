import { createElement } from 'react';
import TagsPage from './main';

export const tagsListing = ( context, next ) => {
	context.primary = createElement( TagsPage );
	next();
};
