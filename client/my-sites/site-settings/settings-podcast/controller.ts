import { createElement } from 'react';
import PodcastingDetails from '../podcasting-details';
import type { Callback } from '@automattic/calypso-router';

export const createPodcastSettings: Callback = ( context, next ) => {
	context.primary = createElement( PodcastingDetails );
	next();
};
