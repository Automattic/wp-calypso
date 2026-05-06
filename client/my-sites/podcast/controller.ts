import { createElement } from 'react';
import EpisodeStats from './components/episode-stats';
import PodcastMain from './main';
import type { Callback } from '@automattic/calypso-router';

export const createPodcast: Callback = ( context, next ) => {
	context.section.name = 'podcasting';
	context.primary = createElement( PodcastMain, {
		section: context.params.section,
	} );
	next();
};

export const createPodcastEpisodeStats: Callback = ( context, next ) => {
	context.section.name = 'podcasting';
	context.primary = createElement( EpisodeStats, {
		postId: Number( context.params.postId ),
	} );
	next();
};
