/** @format */

/**
 * Internal dependencies
 */
import './shared/public-path';
import './editor-shared/block-category'; // Register the Jetpack category

// TODO: Generate dyanmically from index.json
// Appending `Block` to the names to keep `Map` from colliding with JS' Map
import * as ContactFormBlock from 'gutenberg/extensions/contact-form/editor';
import * as MarkdownBlock from 'gutenberg/extensions/markdown/editor';
import * as MapBlock from 'gutenberg/extensions/map/editor';
import * as PublicizeBlock from 'gutenberg/extensions/publicize/editor';
import * as SimplePaymentsBlock from 'gutenberg/extensions/simple-payments/editor';

export default {
	[ ContactFormBlock.name ]: ContactFormBlock.settings,
	[ MarkdownBlock.name ]: MarkdownBlock.settings,
	[ MapBlock.name ]: MapBlock.settings,
	[ PublicizeBlock.name ]: PublicizeBlock.settings,
	[ SimplePaymentsBlock.name ]: SimplePaymentsBlock.settings,
};
