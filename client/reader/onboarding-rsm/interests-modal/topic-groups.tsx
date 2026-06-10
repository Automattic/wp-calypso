import { __ } from '@wordpress/i18n';
import designImage from 'calypso/assets/images/reader/onboarding/design.webp';
import foodImage from 'calypso/assets/images/reader/onboarding/food.webp';
import musicImage from 'calypso/assets/images/reader/onboarding/music.webp';
import photographyImage from 'calypso/assets/images/reader/onboarding/photography.webp';
import scienceImage from 'calypso/assets/images/reader/onboarding/science.webp';
import subscribedImage from 'calypso/assets/images/reader/onboarding/subscribed.webp';
import techImage from 'calypso/assets/images/reader/onboarding/tech.webp';
import travelImage from 'calypso/assets/images/reader/onboarding/travel.webp';

export type TopicGroup = {
	id: string;
	title: string;
	description: string;
	imageUrl: string;
	tags: string[];
};

export const getTopicGroups = (): TopicGroup[] => {
	const titles = {
		mostSubscribed: __( 'Most Subscribed' ),
		foodDrinks: __( 'Food & Drinks' ),
		travelWorld: __( 'Travel & World' ),
		photographyArts: __( 'Photography & Arts' ),
		techDevelopment: __( 'Tech & Development' ),
		natureScience: __( 'Nature & Science' ),
		designCraft: __( 'Design & Craft' ),
		musicCulture: __( 'Music & Culture' ),
	};

	const img = {
		mostSubscribed: subscribedImage,
		foodDrinks: foodImage,
		travelWorld: travelImage,
		photographyArts: photographyImage,
		techDevelopment: techImage,
		natureScience: scienceImage,
		designCraft: designImage,
		musicCulture: musicImage,
	};

	return [
		{
			id: 'most-subscribed',
			title: titles.mostSubscribed,
			description: __(
				'Check out our most read sites and authors from the entire WordPress universe.'
			),
			imageUrl: img.mostSubscribed,
			tags: [],
		},
		{
			id: 'food-drinks',
			title: titles.foodDrinks,
			description: __(
				'Recipes, restaurant culture, and the joy of cooking from writers who eat well.'
			),
			imageUrl: img.foodDrinks,
			tags: [ 'food', 'drinks', 'dining' ],
		},
		{
			id: 'travel-world',
			title: titles.travelWorld,
			description: __( 'From people who go places. Flights, remote trails, and more.' ),
			imageUrl: img.travelWorld,
			tags: [ 'travel', 'world-travel' ],
		},
		{
			id: 'photography-arts',
			title: titles.photographyArts,
			description: __(
				'Photographers, illustrators, writers and makers sharing process and work.'
			),
			imageUrl: img.photographyArts,
			tags: [ 'photography', 'art' ],
		},
		{
			id: 'tech-development',
			title: titles.techDevelopment,
			description: __(
				'Deep dives into software, tools, and the craft of building things on the internet.'
			),
			imageUrl: img.techDevelopment,
			tags: [ 'technology', 'software' ],
		},
		{
			id: 'nature-science',
			title: titles.natureScience,
			description: __(
				'Field notes, big ideas, and the slow wonder of paying attention to the world.'
			),
			imageUrl: img.natureScience,
			tags: [ 'nature', 'science', 'space' ],
		},
		{
			id: 'design-craft',
			title: titles.designCraft,
			description: __( 'The thinking behind good design, from typography to furniture to film.' ),
			imageUrl: img.designCraft,
			tags: [ 'design', 'diy' ],
		},
		{
			id: 'music-culture',
			title: titles.musicCulture,
			description: __( 'Music writing that goes beyond the chart — reviews, history, interviews.' ),
			imageUrl: img.musicCulture,
			tags: [ 'music', 'movies', 'culture' ],
		},
	];
};
