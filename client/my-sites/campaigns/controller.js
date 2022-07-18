import { translate } from 'i18n-calypso';
import page from 'page';
import { createElement } from 'react';
import Sharing from './main';
import MarketingTools from './tools';

export const redirectMarketingTools = ( context ) => {
	page.redirect( '/campaigns/all/' + context.params.domain );
};

export const layout = ( context, next ) => {
	const { contentComponent, pathname } = context;

	context.primary = createElement( Sharing, { contentComponent, pathname } );

	next();
};

export const marketingTools = ( context, next ) => {
	context.contentComponent = createElement( MarketingTools );

	next();
};
