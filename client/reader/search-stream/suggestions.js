/**
 * External Dependencies
 */
import { map, sampleSize } from 'lodash';

/**
 * Internal Dependencies
 */
import TagSubscriptions from 'lib/reader-tags/subscriptions';
import i18nUtils from 'lib/i18n-utils';

export const suggestions = {
	en: [
		'Astrology',
		'Batman',
		'Beach',
		'Beautiful',
		'Bloom',
		'Chickens',
		'Cocktails',
		'Colorado',
		'Craft Beer',
		'Cute',
		'DIY',
		'Delicious',
		'Dogs',
		'Elasticsearch',
		'Fabulous',
		'Farm',
		'Flowers',
		'Funny',
		'Garden',
		'Groovy',
		'Happy Place',
		'Hiking',
		'Homesteading',
		'Iceland',
		'Inspiration',
		'Juno',
		'Mathematics',
		'Michigan',
		'Monkeys',
		'Mountain Biking',
		'Overwatch',
		'Pride',
		'Recipe',
		'Red Sox',
		'Robots',
		'Scenic',
		'Sharks',
		'Sous vide',
		'Sunday Brunch',
		'Tibet',
		'Toddlers',
		'Travel Backpacks',
		'Travel',
		'Woodworking',
		'WordPress',
		'Zombies',
		'Food',
		'Writing',
		'Life',
		'Happy Place',
		'Art',
		'DIY',
		'Love',
		'Health',
		'Funny',
		'Fashion',
		'Fitness',
		'Anime',
		'Philosophy',
		'Yoga',
		'Travel',
		'Beauty',
		'Politics',
		'Parenting',
		'Photography',
		'Books',
		'Technology',
		'Vegan',
		'Motivation',
		'Poetry',
		'Psychology',
		'Makeup',
		'Homeschool',
		'Community Pool'
	]
};

export function getSuggestions( count = 3 ) {
	const tags = TagSubscriptions.get();
	if ( tags && tags.length > count ) {
		return map( sampleSize( tags, count ), tag => ( tag.display_name || tag.slug ).replace( /-/g, ' ' ) );
	}

	const lang = i18nUtils.getLocaleSlug();
	if ( suggestions[ lang ] ) {
		return sampleSize( suggestions[ lang ], count );
	}

	return null;
}
