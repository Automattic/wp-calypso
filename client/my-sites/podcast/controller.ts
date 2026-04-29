import { createElement } from 'react';
import PodcastMain from './main';
import type { Callback } from '@automattic/calypso-router';

export const createPodcast: Callback = ( context, next ) => {
	context.section.name = 'podcast';
	context.primary = createElement( PodcastMain, {
		section: context.params.section,
	} );
	next();
};
