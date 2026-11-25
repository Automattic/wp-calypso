import { __ } from '@wordpress/i18n';
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
import type { RecommendedBlog } from './types';

export type { RecommendedBlog, RecommendedBlogGroup } from './types';

// Every list, in onboarding order: step 3 shows a reader's groups in this order.
const RECOMMENDED_BLOG_LISTS = {
	'most-subscribed': { getTitle: () => __( 'Most subscribed' ), getBlogs: getMostSubscribedBlogs },
	food: { getTitle: () => __( 'Food' ), getBlogs: getFoodBlogs },
	drinks: { getTitle: () => __( 'Drinks' ), getBlogs: getDrinksBlogs },
	dining: { getTitle: () => __( 'Dining' ), getBlogs: getDiningBlogs },
	travel: { getTitle: () => __( 'Travel' ), getBlogs: getTravelBlogs },
	'world-travel': { getTitle: () => __( 'World travel' ), getBlogs: getWorldTravelBlogs },
	photography: { getTitle: () => __( 'Photography' ), getBlogs: getPhotographyBlogs },
	art: { getTitle: () => __( 'Art' ), getBlogs: getArtBlogs },
	technology: { getTitle: () => __( 'Technology' ), getBlogs: getTechnologyBlogs },
	software: { getTitle: () => __( 'Software' ), getBlogs: getSoftwareBlogs },
	nature: { getTitle: () => __( 'Nature' ), getBlogs: getNatureBlogs },
	science: { getTitle: () => __( 'Science' ), getBlogs: getScienceBlogs },
	space: { getTitle: () => __( 'Space' ), getBlogs: getSpaceBlogs },
	design: { getTitle: () => __( 'Design' ), getBlogs: getDesignBlogs },
	diy: { getTitle: () => __( 'DIY' ), getBlogs: getDiyBlogs },
	music: { getTitle: () => __( 'Music' ), getBlogs: getMusicBlogs },
	movies: { getTitle: () => __( 'Movies' ), getBlogs: getMoviesBlogs },
	culture: { getTitle: () => __( 'Culture' ), getBlogs: getCultureBlogs },
	books: { getTitle: () => __( 'Books' ), getBlogs: getBooksBlogs },
	family: { getTitle: () => __( 'Family' ), getBlogs: getFamilyBlogs },
	writing: { getTitle: () => __( 'Writing' ), getBlogs: getWritingBlogs },
	politics: { getTitle: () => __( 'Politics' ), getBlogs: getPoliticsBlogs },
	blogging: { getTitle: () => __( 'Blogging' ), getBlogs: getBloggingBlogs },
	fashion: { getTitle: () => __( 'Fashion' ), getBlogs: getFashionBlogs },
	health: { getTitle: () => __( 'Health' ), getBlogs: getHealthBlogs },
	humor: { getTitle: () => __( 'Humor' ), getBlogs: getHumorBlogs },
	poetry: { getTitle: () => __( 'Poetry' ), getBlogs: getPoetryBlogs },
	love: { getTitle: () => __( 'Love' ), getBlogs: getLoveBlogs },
	entertainment: { getTitle: () => __( 'Entertainment' ), getBlogs: getEntertainmentBlogs },
	education: { getTitle: () => __( 'Education' ), getBlogs: getEducationBlogs },
	inspiration: { getTitle: () => __( 'Inspiration' ), getBlogs: getInspirationBlogs },
	relationships: { getTitle: () => __( 'Relationships' ), getBlogs: getRelationshipsBlogs },
	religion: { getTitle: () => __( 'Religion' ), getBlogs: getReligionBlogs },
	sports: { getTitle: () => __( 'Sports' ), getBlogs: getSportsBlogs },
	business: { getTitle: () => __( 'Business' ), getBlogs: getBusinessBlogs },
	creativity: { getTitle: () => __( 'Creativity' ), getBlogs: getCreativityBlogs },
	beauty: { getTitle: () => __( 'Beauty' ), getBlogs: getBeautyBlogs },
	work: { getTitle: () => __( 'Work' ), getBlogs: getWorkBlogs },
	history: { getTitle: () => __( 'History' ), getBlogs: getHistoryBlogs },
	reading: { getTitle: () => __( 'Reading' ), getBlogs: getReadingBlogs },
	'social-media': { getTitle: () => __( 'Social media' ), getBlogs: getSocialMediaBlogs },
	cooking: { getTitle: () => __( 'Cooking' ), getBlogs: getCookingBlogs },
	internet: { getTitle: () => __( 'Internet' ), getBlogs: getInternetBlogs },
	lifestyle: { getTitle: () => __( 'Lifestyle' ), getBlogs: getLifestyleBlogs },
	media: { getTitle: () => __( 'Media' ), getBlogs: getMediaBlogs },
	fitness: { getTitle: () => __( 'Fitness' ), getBlogs: getFitnessBlogs },
	environment: { getTitle: () => __( 'Environment' ), getBlogs: getEnvironmentBlogs },
} satisfies Record< string, { getTitle: () => string; getBlogs: () => RecommendedBlog[] } >;

export type RecommendedBlogListKey = keyof typeof RECOMMENDED_BLOG_LISTS;

export const RECOMMENDED_BLOG_LIST_KEYS = Object.keys(
	RECOMMENDED_BLOG_LISTS
) as RecommendedBlogListKey[];

export const getRecommendedBlogListTitle = ( key: RecommendedBlogListKey ): string =>
	RECOMMENDED_BLOG_LISTS[ key ].getTitle();

export const getRecommendedBlogs = ( key: RecommendedBlogListKey ): RecommendedBlog[] =>
	RECOMMENDED_BLOG_LISTS[ key ].getBlogs();
