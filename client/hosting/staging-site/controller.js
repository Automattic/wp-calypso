import { createElement } from 'react';
import StagingSite from './components/staging-site';

export function renderStagingSite( context, next ) {
	context.primary = createElement( StagingSite );
	next();
}
