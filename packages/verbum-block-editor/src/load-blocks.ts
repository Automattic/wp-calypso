import * as embed from '@wordpress/block-library/build-module/embed';
import * as image from '@wordpress/block-library/build-module/image';
import * as list from '@wordpress/block-library/build-module/list';
import * as listItem from '@wordpress/block-library/build-module/list-item';
import * as paragraph from '@wordpress/block-library/build-module/paragraph';
import * as quote from '@wordpress/block-library/build-module/quote';
import { setDefaultBlockName, registerBlockType, createBlock } from '@wordpress/blocks';
import type { Block } from '@wordpress/blocks';

interface EmbedBlock extends Block {
	settings: {
		variations: Array< {
			name: string;
			patterns: RegExp[];
		} >;
	};
}

const DISABLED_VARIATIONS = [ 'imgur', 'kickstarter', 'wordpress-tv' ];

/**
 * Check if the URL is a valid URL.
 * @param url URL to check
 * @returns true if the URL is valid, false otherwise
 */
const isUrl = ( url: string ) => {
	try {
		return Boolean( new URL( url ) );
	} catch ( e ) {
		return false;
	}
};

/**
 * Run the URL against the available embed patterns to determine if the URL is embeddable.
 * @param url URL to check
 * @returns true if the URL is an embeddable URL, false otherwise
 */
function isEmbedUrl( url: string ): boolean {
	const embedRegexes = ( embed as EmbedBlock ).settings.variations
		.flatMap(
			( variation: { patterns: RegExp[]; name: string } ) =>
				( 'imgur' !== variation.name && variation.patterns ) || []
		)
		.filter( Boolean );

	return embedRegexes.some( ( regex: RegExp ) => regex.test( url ) );
}

/**
 * Check if the URL is an image URL.
 * @param url URL to check
 * @returns The URL if it is an image URL, false otherwise
 */
function isImage( url: string ) {
	try {
		const providedUrl = new URL( url );
		// Strip the query params from the URL.
		const withoutParams = `${ providedUrl.protocol }//${ providedUrl.host }${ providedUrl.pathname }`;

		// Only allow HTTPS URLs.
		return providedUrl.protocol === 'https:' && /\.(jpg|jpeg|png|webp)$/i.test( withoutParams );
	} catch ( e ) {
		return false;
	}
}

/**
 * Load the blocks with customizations.
 * This is used to load and filter the blocks that we want to use.
 * We only want to load the blocks that we need to avoid extra bloat.
 */
export const loadBlocksWithCustomizations = () => {
	[ paragraph, image, list, listItem, quote, embed ].forEach( ( block ) => {
		const { metadata, settings, name } = block as any;

		/**
		 * Customize the paragraph block.
		 * The paragraph block is the entry point for pasting content.
		 * For this reason we define custom transforms to convert
		 * things as we need.
		 */
		if ( name === 'core/paragraph' ) {
			const customTransforms = {
				...settings.transforms,
				from: [
					...settings.transforms.from,
					// Disallow uploading file for now.
					{
						type: 'files',
						isMatch: () => true,
						transform: () => [],
					},
					// Transform image links to image block.
					{
						type: 'raw',
						isMatch: ( node: HTMLElement ) => {
							return node.nodeName === 'P' && node.textContent && isImage( node.textContent );
						},
						transform: ( node: HTMLElement ) =>
							node.textContent && createBlock( 'core/image', { url: node.textContent } ),
					},
					// Transform embed links to embed block if they are embeddable.
					{
						type: 'raw',
						isMatch: ( node: HTMLElement ) =>
							node.nodeName === 'P' && node.textContent && isEmbedUrl( node.textContent ),
						transform: ( node: HTMLElement ) =>
							createBlock( 'core/embed', { url: node.textContent } ),
					},
					// Transform links to link block if they are not embeddable.
					{
						type: 'raw',
						isMatch: ( node: HTMLElement ) =>
							node.nodeName === 'P' &&
							node.textContent &&
							isUrl( node.textContent ) &&
							! isEmbedUrl( node.textContent ),
						transform: ( node: HTMLElement ) => {
							const providedUrl = node.textContent && new URL( node.textContent );
							const content =
								providedUrl && providedUrl.protocol === 'https:'
									? '<a href="' +
									  node.textContent +
									  '" rel="nofollow ugc">' +
									  node.textContent +
									  '</a>'
									: node.textContent;
							return createBlock( 'core/paragraph', { content } );
						},
					},
				],
			};

			settings.transforms = customTransforms;
		}

		/**
		 * Customize the image block.
		 * We disable the resize option because the canvas size
		 * is limited.
		 */
		if ( name === 'core/image' ) {
			const edit = settings.edit;

			const customEdit = ( props: any ) => {
				props.context.allowResize = false;

				return edit( props );
			};

			settings.edit = customEdit;
		}

		/**
		 * Customize the embed block.
		 * imgur embeds are not working so we remove them.
		 */
		if ( name === 'core/embed' ) {
			const customVariations = settings.variations.filter(
				( variation: { name: string } ) => ! DISABLED_VARIATIONS.includes( variation.name )
			);

			// Add a WordPress.com variation.
			const wpVariation = customVariations.find( ( v: any ) => v.name === 'wordpress' );
			wpVariation.patterns = [ /^https?:\/\/(\w+)\.wordpress\.com\/.+/i ];
			wpVariation.title = 'WordPress.com';
			wpVariation.isActive = ( _: null, variationAttributes: any ) =>
				variationAttributes.providerNameSlug === 'wordpress';

			settings.variations = customVariations;
		}

		registerBlockType( { name, ...metadata }, settings );
	} );

	setDefaultBlockName( paragraph.name );
};
