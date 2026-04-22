import { createElement } from 'react';
import PodcastingMain from './main';
import type { Callback } from '@automattic/calypso-router';

export const createPodcasting: Callback = ( context, next ) => {
	context.section.name = 'podcasting';
	context.primary = createElement( PodcastingMain, {
		section: context.params.section,
		path: context.path,
	} );
	next();
};
