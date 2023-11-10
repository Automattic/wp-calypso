import { Callback } from '@automattic/calypso-router';
import { createElement } from 'react';
import PodcastingDetails from '../podcasting-details';

export const createPodcastSettings: Callback = ( context, next ) => {
	context.primary = createElement( PodcastingDetails );
	next();
};
