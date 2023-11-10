import { Callback } from '@automattic/calypso-router';
import { createElement } from 'react';
import NewsletterSettings from './main';

export const createNewsletterSettings: Callback = ( context, next ) => {
	context.primary = createElement( NewsletterSettings );
	next();
};
