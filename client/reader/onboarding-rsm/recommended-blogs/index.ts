import { getArtBlogs } from './art';
import { getCultureBlogs } from './culture';
import { getDesignBlogs } from './design';
import { getDiningBlogs } from './dining';
import { getDiyBlogs } from './diy';
import { getDrinksBlogs } from './drinks';
import { getFoodBlogs } from './food';
import { getMostSubscribedBlogs } from './most-subscribed';
import { getMoviesBlogs } from './movies';
import { getMusicBlogs } from './music';
import { getNatureBlogs } from './nature';
import { getPhotographyBlogs } from './photography';
import { getScienceBlogs } from './science';
import { getSoftwareBlogs } from './software';
import { getSpaceBlogs } from './space';
import { getTechnologyBlogs } from './technology';
import { getTravelBlogs } from './travel';
import { getWorldTravelBlogs } from './world-travel';
import type { RecommendedBlog, RecommendedBlogListKey } from './types';

export { RECOMMENDED_BLOG_LIST_KEYS } from './types';
export type { RecommendedBlog, RecommendedBlogGroup, RecommendedBlogListKey } from './types';

export const recommendedBlogGetters: Record< RecommendedBlogListKey, () => RecommendedBlog[] > = {
	'most-subscribed': getMostSubscribedBlogs,
	food: getFoodBlogs,
	drinks: getDrinksBlogs,
	dining: getDiningBlogs,
	travel: getTravelBlogs,
	'world-travel': getWorldTravelBlogs,
	photography: getPhotographyBlogs,
	art: getArtBlogs,
	technology: getTechnologyBlogs,
	software: getSoftwareBlogs,
	nature: getNatureBlogs,
	science: getScienceBlogs,
	space: getSpaceBlogs,
	design: getDesignBlogs,
	diy: getDiyBlogs,
	music: getMusicBlogs,
	movies: getMoviesBlogs,
	culture: getCultureBlogs,
};

export const getRecommendedBlogs = ( key: RecommendedBlogListKey ): RecommendedBlog[] =>
	recommendedBlogGetters[ key ]();
