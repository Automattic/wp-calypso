import { decodeEntities } from '@wordpress/html-entities';
import { __, sprintf } from '@wordpress/i18n';
import snapshot from './hub-resource-snapshot.json';
import type { LibraryResource, ResourceFormat } from './types';

const productNames: Record< string, string > = { Woo: 'WooCommerce', 'WP VIP': 'WordPress VIP' };
const contentTypes: Record< string, string > = {
	Guides: 'Guide',
	'One-pagers': 'One-pager',
	'Pitch Decks': 'Slide deck',
	'Case Studies': 'Case study',
	'Talk Tracks': 'Talk track',
	Checklists: 'Checklist',
	'Product Videos': 'Video',
	Battlecards: 'Battlecard',
	Webinars: 'Webinar',
	'Technical Briefs': 'Technical brief',
};
const formats: Record< string, ResourceFormat > = {
	pdf: 'PDF',
	video: 'Video',
	google_slides: 'Google Slides',
	google_doc: 'Google Docs',
	google_sheets: 'Google Sheets',
};

// Local editorial choices for the preview; these fields are not supplied by the hub.
const stages: Record< number, string > = {
	461: 'Grow',
	459: 'Manage',
	457: 'Grow',
	453: 'Sell',
	451: 'Sell',
	443: 'Sell',
	439: 'Learn',
	437: 'Manage',
	434: 'Sell',
	423: 'Learn',
	421: 'Manage',
	418: 'Sell',
	415: 'Learn',
	400: 'Manage',
	186: 'Learn',
	129: 'Sell',
	125: 'Manage',
	143: 'Grow',
	241: 'Grow',
	283: 'Manage',
};
export const hubRecommendationIds = [
	'hub-186',
	'hub-129',
	'hub-241',
	'hub-125',
	'hub-400',
	'hub-423',
];
export const hubFeaturedIds = [ 'hub-186', 'hub-129', 'hub-143', 'hub-125', 'hub-423' ];

function plainText( html: string ) {
	return decodeEntities( html.replace( /<[^>]*>/g, ' ' ) )
		.replace( /\s+/g, ' ' )
		.trim();
}

export const hubResources: LibraryResource[] = snapshot.resources.map( ( resource ) => {
	const products = resource.products.map( ( product ) => productNames[ product ] ?? product );
	const specificProducts = products.filter( ( product ) => product !== 'Automattic for Agencies' );
	const title = plainText( resource.title );
	// Multi-product documents use A4A unless the title identifies a particular product.
	const product =
		specificProducts.length === 1
			? specificProducts[ 0 ]
			: specificProducts.find( ( name ) => title.toLowerCase().includes( name.toLowerCase() ) ) ??
			  'Automattic for Agencies';
	return {
		id: `hub-${ resource.id }`,
		title,
		// Temporary fallback copy shared by every library presentation.
		description:
			plainText( resource.description ) ||
			sprintf(
				/* translators: %s is a product name. */
				__(
					'Explore %s with practical guidance for your agency. Build your knowledge, prepare for client conversations, and plan your next project.'
				),
				product
			),
		product,
		products,
		stage: stages[ resource.id ] ?? '',
		audience: 'Agency-facing',
		contentType:
			contentTypes[ resource.contentTypes[ 0 ] ] ?? resource.contentTypes[ 0 ] ?? 'Resource',
		format:
			formats[ resource.fileType ] ??
			( /\.pdf(?:[?#]|$)/i.test( resource.url ) ? 'PDF' : 'Webpage' ),
		url: resource.url.replace( /^http:\/\/docs\.google\.com\//, 'https://docs.google.com/' ),
	};
} );
