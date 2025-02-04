import { createElement } from 'react';
import NewsletterSettings from './main';
import type { Callback } from '@automattic/calypso-router';

export const createNewsletterSettings: Callback = ( context, next ) => {
	context.primary = createElement( NewsletterSettings );
	next();
};
