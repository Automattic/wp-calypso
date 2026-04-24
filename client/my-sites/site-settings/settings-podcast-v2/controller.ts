import { createElement } from 'react';
import PodcastingV2 from '../podcasting-v2';
import PodcastingDistribution from '../podcasting-v2/distribution';
import type { Callback } from '@automattic/calypso-router';

export const createPodcastSettingsV2: Callback = ( context, next ) => {
	context.section.name = 'settings-podcasting-v2';
	context.primary = createElement( PodcastingV2 );
	next();
};

export const createPodcastDistributionV2: Callback = ( context, next ) => {
	context.section.name = 'settings-podcasting-v2';
	context.primary = createElement( PodcastingDistribution );
	next();
};
