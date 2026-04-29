import { __ } from '@wordpress/i18n';

export type TopicGroup = {
	id: string;
	title: string;
	description: string;
	imageUrl: string;
	tags: string[];
};

const createPlaceholderImage = ( label: string ): string =>
	`data:image/svg+xml;charset=UTF-8,${ encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 338" role="img" aria-label="${ label }">
			<defs>
				<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#f6f7f7" />
					<stop offset="100%" stop-color="#dcdcde" />
				</linearGradient>
			</defs>
			<rect width="600" height="338" fill="url(#bg)" />
			<circle cx="84" cy="84" r="32" fill="#c3c4c7" opacity="0.55" />
			<rect x="48" y="238" width="240" height="20" rx="10" fill="#3858e9" opacity="0.9" />
			<rect x="48" y="270" width="180" height="14" rx="7" fill="#50575e" opacity="0.45" />
			<text x="48" y="210" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="32" font-weight="700" fill="#1d2327">${ label }</text>
		</svg>`
	) }`;

// Inline SVG placeholders avoid third-party image requests while preserving
// thumbnail rendering until first-party curated artwork is available.
const IMG = {
	mostSubscribed: createPlaceholderImage( 'Most Subscribed' ),
	foodDrinks: createPlaceholderImage( 'Food & Drinks' ),
	travelWorld: createPlaceholderImage( 'Travel & World' ),
	photographyArts: createPlaceholderImage( 'Photography & Arts' ),
	techDevelopment: createPlaceholderImage( 'Tech & Development' ),
	natureScience: createPlaceholderImage( 'Nature & Science' ),
	designCraft: createPlaceholderImage( 'Design & Craft' ),
	musicCulture: createPlaceholderImage( 'Music & Culture' ),
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
