import { translate } from 'i18n-calypso';
import { createElement } from 'react';
import TagsPage from './main';

export const tagsListing = ( context, next ) => {
	context.headerSection = (
		<div>
			<h1>{ translate( 'Tags' ) }</h1>
			<p>{ translate( 'Discover unique topics, follow your interests, or start writing.' ) }</p>
		</div>
	);
	context.primary = createElement( TagsPage );
	next();
};
