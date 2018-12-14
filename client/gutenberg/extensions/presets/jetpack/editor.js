/** @format */

/**
 * Internal dependencies
 */
import './shared/public-path';
import './editor-shared/block-category'; // Register the Jetpack category
import extensionSlugsJson from './index.json';

// TODO: Generate dyanmically from index.json
// Appending `Block` to the names to keep `Map` from colliding with JS' Map
import * as ContactFormBlock from 'gutenberg/extensions/contact-form';
import * as MarkdownBlock from 'gutenberg/extensions/markdown';
import * as MapBlock from 'gutenberg/extensions/map';
import * as PublicizeBlock from 'gutenberg/extensions/publicize';
import * as RelatedPostsBlock from 'gutenberg/extensions/related-posts';
import * as SimplePaymentsBlock from 'gutenberg/extensions/simple-payments';
import * as SubscriptionsBlock from 'gutenberg/extensions/subscriptions';
import * as TiledGalleryBlock from 'gutenberg/extensions/tiled-gallery';
import * as VRBlock from 'gutenberg/extensions/vr';
import { isEnabled } from 'config';

const extensionSlugs = [
	...extensionSlugsJson.production,
	...( isEnabled( 'jetpack/blocks/beta' ) ? extensionSlugsJson.beta : [] ),
];

export async function getExtensions() {
	const promises = extensionSlugs.map( slug =>
		import( '../../' + slug ).then( ( { children, name, settings } ) => ( {
			children,
			name,
			settings,
		} ) )
	);

	return await Promise.all( promises );
}

export default [
	{ name: ContactFormBlock.name, settings: ContactFormBlock.settings },
	...ContactFormBlock.children,
	MarkdownBlock,
	MapBlock,
	PublicizeBlock,
	SimplePaymentsBlock,
	SubscriptionsBlock,
	...( isEnabled( 'jetpack/blocks/beta' )
		? [ RelatedPostsBlock, TiledGalleryBlock, VRBlock ]
		: [] ),
];
