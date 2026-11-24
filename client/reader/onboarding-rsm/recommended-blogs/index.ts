import { getArtBlogs } from './art';
import { getBeautyBlogs } from './beauty';
import { getBloggingBlogs } from './blogging';
import { getBooksBlogs } from './books';
import { getBusinessBlogs } from './business';
import { getCookingBlogs } from './cooking';
import { getCreativityBlogs } from './creativity';
import { getCultureBlogs } from './culture';
import { getDesignBlogs } from './design';
import { getDiningBlogs } from './dining';
import { getDiyBlogs } from './diy';
import { getDrinksBlogs } from './drinks';
import { getEducationBlogs } from './education';
import { getEntertainmentBlogs } from './entertainment';
import { getEnvironmentBlogs } from './environment';
import { getFamilyBlogs } from './family';
import { getFashionBlogs } from './fashion';
import { getFitnessBlogs } from './fitness';
import { getFoodBlogs } from './food';
import { getHealthBlogs } from './health';
import { getHistoryBlogs } from './history';
import { getHumorBlogs } from './humor';
import { getInspirationBlogs } from './inspiration';
import { getInternetBlogs } from './internet';
import { getLifestyleBlogs } from './lifestyle';
import { getLoveBlogs } from './love';
import { getMediaBlogs } from './media';
import { getMostSubscribedBlogs } from './most-subscribed';
import { getMoviesBlogs } from './movies';
import { getMusicBlogs } from './music';
import { getNatureBlogs } from './nature';
import { getPhotographyBlogs } from './photography';
import { getPoetryBlogs } from './poetry';
import { getPoliticsBlogs } from './politics';
import { getReadingBlogs } from './reading';
import { getRelationshipsBlogs } from './relationships';
import { getReligionBlogs } from './religion';
import { getScienceBlogs } from './science';
import { getSocialMediaBlogs } from './social-media';
import { getSoftwareBlogs } from './software';
import { getSpaceBlogs } from './space';
import { getSportsBlogs } from './sports';
import { getTechnologyBlogs } from './technology';
import { getTravelBlogs } from './travel';
import { getWorkBlogs } from './work';
import { getWorldTravelBlogs } from './world-travel';
import { getWritingBlogs } from './writing';
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
	books: getBooksBlogs,
	family: getFamilyBlogs,
	writing: getWritingBlogs,
	politics: getPoliticsBlogs,
	blogging: getBloggingBlogs,
	fashion: getFashionBlogs,
	health: getHealthBlogs,
	humor: getHumorBlogs,
	poetry: getPoetryBlogs,
	love: getLoveBlogs,
	entertainment: getEntertainmentBlogs,
	education: getEducationBlogs,
	inspiration: getInspirationBlogs,
	relationships: getRelationshipsBlogs,
	religion: getReligionBlogs,
	sports: getSportsBlogs,
	business: getBusinessBlogs,
	creativity: getCreativityBlogs,
	beauty: getBeautyBlogs,
	work: getWorkBlogs,
	history: getHistoryBlogs,
	reading: getReadingBlogs,
	'social-media': getSocialMediaBlogs,
	cooking: getCookingBlogs,
	internet: getInternetBlogs,
	lifestyle: getLifestyleBlogs,
	media: getMediaBlogs,
	fitness: getFitnessBlogs,
	environment: getEnvironmentBlogs,
};

export const getRecommendedBlogs = ( key: RecommendedBlogListKey ): RecommendedBlog[] =>
	recommendedBlogGetters[ key ]();
