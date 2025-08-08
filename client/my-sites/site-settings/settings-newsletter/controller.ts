import { createElement } from 'react';
import JetpackNewsletter from './jetpack-newsletter';
import NewsletterSettings from './main';
import type { Callback } from '@automattic/calypso-router';

export const createNewsletterSettings: Callback = ( context, next ) => {
	context.primary = createElement( NewsletterSettings );
	next();
};

export const jetpackNewsletter: Callback = ( context, next ) => {
	context.primary = createElement( JetpackNewsletter );
	next();
};
