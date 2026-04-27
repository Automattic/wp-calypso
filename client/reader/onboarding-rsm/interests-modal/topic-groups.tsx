import { __ } from '@wordpress/i18n';

export type TopicGroup = {
	id: string;
	title: string;
	description: string;
	imageUrl: string;
	tags: string[];
};

// Placeholder Unsplash images, sized for card thumbnails. Swap with curated
// art when finalized.
const IMG = {
	mostSubscribed:
		'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80',
	foodDrinks:
		'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
	travelWorld:
		'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
	photographyArts:
		'https://images.unsplash.com/photo-1519638831568-d9897f54ed69?auto=format&fit=crop&w=600&q=80',
	techDevelopment:
		'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
	natureScience:
		'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80',
	designCraft:
		'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=600&q=80',
	musicCulture:
		'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
};

export const getTopicGroups = (): TopicGroup[] => [
	{
		id: 'most-subscribed',
		title: __( 'Most Subscribed' ),
		description: __( 'Check out most read sites and authors from the entire WordPress universe.' ),
		imageUrl: IMG.mostSubscribed,
		tags: [],
	},
	{
		id: 'food-drinks',
		title: __( 'Food & Drinks' ),
		description: __(
			'Recipes, restaurant culture, and the joy of cooking from a few sites set out.'
		),
		imageUrl: IMG.foodDrinks,
		tags: [ 'food', 'drinks', 'dining' ],
	},
	{
		id: 'travel-world',
		title: __( 'Travel & World' ),
		description: __( 'From people who go places. Flights, remote trails, and more.' ),
		imageUrl: IMG.travelWorld,
		tags: [ 'travel', 'world-travel' ],
	},
	{
		id: 'photography-arts',
		title: __( 'Photography & Arts' ),
		description: __(
			'Photographers, illustrators, writers and makers sharing process, art, and work.'
		),
		imageUrl: IMG.photographyArts,
		tags: [ 'photography', 'art' ],
	},
	{
		id: 'tech-development',
		title: __( 'Tech & Development' ),
		description: __(
			'Deep dives into software, tools, and the craft of building things on the internet.'
		),
		imageUrl: IMG.techDevelopment,
		tags: [ 'technology', 'software' ],
	},
	{
		id: 'nature-science',
		title: __( 'Nature & Science' ),
		description: __(
			'Plant notes, big ideas, and the keen wonder of paying attention to the world.'
		),
		imageUrl: IMG.natureScience,
		tags: [ 'nature', 'science', 'space' ],
	},
	{
		id: 'design-craft',
		title: __( 'Design & Craft' ),
		description: __( 'The thinking behind good design, from typography to furniture to film.' ),
		imageUrl: IMG.designCraft,
		tags: [ 'design', 'diy' ],
	},
	{
		id: 'music-culture',
		title: __( 'Music & Culture' ),
		description: __( 'Music writing that goes beyond the chart — reviews, history, true stories.' ),
		imageUrl: IMG.musicCulture,
		tags: [ 'music', 'culture' ],
	},
];
