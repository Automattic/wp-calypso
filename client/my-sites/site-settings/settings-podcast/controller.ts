import { createElement } from 'react';
import PodcastingDetails from '../podcasting-details';
import JetpackPodcasting from './jetpack-podcasting';
import type { Callback } from '@automattic/calypso-router';

export const createPodcastSettings: Callback = ( context, next ) => {
	context.primary = createElement( PodcastingDetails );
	next();
};

export const jetpackPodcasting: Callback = ( context, next ) => {
	context.primary = createElement( JetpackPodcasting );
	next();
};
