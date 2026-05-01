import { __ } from '@wordpress/i18n';

export type TopicGroup = {
	id: string;
	title: string;
	description: string;
	imageUrl: string;
	tags: string[];
};

const escapeXml = ( value: string ): string =>
	value
		.replaceAll( '&', '&amp;' )
		.replaceAll( '<', '&lt;' )
		.replaceAll( '>', '&gt;' )
		.replaceAll( '"', '&quot;' )
		.replaceAll( "'", '&apos;' );

const createPlaceholderImage = ( label: string ): string =>
	`data:image/svg+xml;charset=UTF-8,${ encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 338" role="img" aria-label="${ escapeXml(
			label
		) }">
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
			<text x="48" y="210" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="32" font-weight="700" fill="#1d2327">${ escapeXml(
				label
			) }</text>
		</svg>`
	) }`;

const placeholderImageCache = new Map< string, string >();

const getPlaceholderImage = ( label: string ): string => {
	const cachedImage = placeholderImageCache.get( label );
	if ( cachedImage ) {
		return cachedImage;
	}
	const image = createPlaceholderImage( label );
	placeholderImageCache.set( label, image );
	return image;
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

	// Inline SVG placeholders avoid third-party image requests while preserving
	// thumbnail rendering until first-party curated artwork is available.
	const img = {
		mostSubscribed: getPlaceholderImage( titles.mostSubscribed ),
		foodDrinks: getPlaceholderImage( titles.foodDrinks ),
		travelWorld: getPlaceholderImage( titles.travelWorld ),
		photographyArts: getPlaceholderImage( titles.photographyArts ),
		techDevelopment: getPlaceholderImage( titles.techDevelopment ),
		natureScience: getPlaceholderImage( titles.natureScience ),
		designCraft: getPlaceholderImage( titles.designCraft ),
		musicCulture: getPlaceholderImage( titles.musicCulture ),
	};

	return [
		{
			id: 'most-subscribed',
			title: titles.mostSubscribed,
			description: __(
				'Check out most read sites and authors from the entire WordPress universe.'
			),
			imageUrl: img.mostSubscribed,
			tags: [],
		},
		{
			id: 'food-drinks',
			title: titles.foodDrinks,
			description: __(
				'Recipes, restaurant culture, and the joy of cooking from a few sites set out.'
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
				'Photographers, illustrators, writers and makers sharing process, art, and work.'
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
				'Plant notes, big ideas, and the keen wonder of paying attention to the world.'
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
			description: __(
				'Music writing that goes beyond the chart — reviews, history, true stories.'
			),
			imageUrl: img.musicCulture,
			tags: [ 'music', 'culture' ],
		},
	];
};
