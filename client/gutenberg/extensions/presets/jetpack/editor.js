/** @format */

/**
 * Internal dependencies
 */
import './shared/public-path';
import './editor-shared/block-category'; // Register the Jetpack category
import extensionSlugs from './index.json';

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

export async function getExtensions() {
	const promises = extensionSlugs.production.map( slug =>
		import( '../../' + slug ).then( ( { name, settings } ) => ( { name, settings } ) )
	);

	return await Promise.all( promises ); // Y U NO RETURN ARRAY BUT PROMISE?
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
