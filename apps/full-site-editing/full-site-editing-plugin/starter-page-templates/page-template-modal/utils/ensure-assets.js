/**
 * External dependencies
 */
import { reduce, isEmpty, forEach, set, map } from 'lodash';

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { removeQueryArgs } from '@wordpress/url';

/**
 * A full asset URL.
 *
 * @typedef {string} URL
 */

/**
 * Gutenberg Block.
 *
 * @typedef {object} GutenbergBlock
 * @property {string} clientId A unique id of the block.
 * @property {string} name A block name, like "core/paragraph".
 * @property {Array<GutenbergBlock>} innerBlocks Nested blocks.
 * @property {object} attributes An object with attributes, different for each block type.
 */

/**
 * Usage object contains an info that certain property is used inside another object.
 *
 * @typedef {object} Usage
 * @property {string} prop Name of the property.
 * @property {Array<string|number>} path A path inside an object where prop is, defined as list of keys.
 */

/**
 * An asset file that is referenced in blocks.
 *
 * @typedef {object} Asset
 * @property {URL} url A full URL of the asset.
 * @property {Array<Usage>} usages A list of {@link Usage} objects.
 */

/**
 * A collection of {@link Asset} objects, keyed by their URLs.
 *
 * @typedef {object.<string, Asset>} Assets URLs as keys, {@link Asset}.as a values.
 */

/**
 * FetchSession describes a set of blocks and their assets.
 *
 * @typedef {object} FetchSession
 * @property {Array<GutenbergBlock>} blocks List of Gutenberg blocks.
 * @property {object<string, GutenbergBlock>} blocksByClientId Blocks, keyed by their `clientId`
 * @property {Assets} assets A list of assets detected in blocks.
 */

/**
 * Extends an {@link Assets} object with a new asset and updates its usages.
 *
 * @param {Assets} assets Object containing assets.
 * @param {URL} url A full URL of the asset.
 * @param {Array<Usage>} usages A list of {@link Usage} objects.
 * @returns {Assets} assets object with the new {@link Asset} included
 */
const addAssetToLoad = ( assets, url, usages ) => {
	// Remove resizing query arguments from the URL.
	url = removeQueryArgs( url, 'w', 's' );

	// Use an existing asset for the URL or make a new one.
	const asset = assets[ url ] || {
		url,
		usages: [],
	};

	// Return new result object, extended with the new/updated asset.
	return {
		...assets,
		[ url ]: {
			...asset,
			// Store where exactly block uses id/url so we can update it later.
			usages: [ ...asset.usages, ...usages ],
		},
	};
};

/**
 * This function is used as a reducer iteratee. It checks if the block
 * contains any image and if so, enqueues it to be downloaded later.
 *
 * @param {FetchSession} session Session object.
 * @param {GutenbergBlock} block Gutenberg Block object.
 * @returns {FetchSession} Updated session object
 */
const findAssetsInBlock = ( session, block ) => {
	// Save a reference for the block so we can later easily
	// find it without any loops and recursion.
	session.blocksByClientId[ block.clientId ] = block;

	// Identify assets in blocks where we expect them.
	switch ( block.name ) {
		// Both of these blocks use same attribute names for image id and url
		// and thus we can share the implementation.
		case 'core/cover':
		case 'core/image': {
			const url = block.attributes.url;
			if ( url ) {
				session.assets = addAssetToLoad( session.assets, url, [
					{ prop: 'url', path: [ block.clientId, 'attributes', 'url' ] },
					{ prop: 'id', path: [ block.clientId, 'attributes', 'id' ] },
				] );
			}
		}
		case 'core/media-text': {
			const url = block.attributes.mediaUrl;
			if ( url && block.attributes.mediaType === 'image' ) {
				session.assets = addAssetToLoad( session.assets, url, [
					{ prop: 'url', path: [ block.clientId, 'attributes', 'mediaUrl' ] },
					{ prop: 'id', path: [ block.clientId, 'attributes', 'mediaId' ] },
				] );
			}
		}
		case 'core/gallery': {
			forEach( block.attributes.images, ( image, i ) => {
				session.assets = addAssetToLoad( session.assets, image.url, [
					{ prop: 'url', path: [ block.clientId, 'attributes', 'images', i, 'url' ] },
					{ prop: 'url', path: [ block.clientId, 'attributes', 'images', i, 'link' ] },
					{ prop: 'id', path: [ block.clientId, 'attributes', 'images', i, 'id' ] },
					{ prop: 'id', path: [ block.clientId, 'attributes', 'ids', i ] },
				] );
			} );
		}
	}

	// Recursively process all inner blocks.
	if ( ! isEmpty( block.innerBlocks ) ) {
		return reduce( block.innerBlocks, findAssetsInBlock, session );
	}

	return session;
};

/**
 * Calls an API that fetches assets and saves the result into the DetectedAssets object.
 *
 * @param {Assets} assets Assets that were detected from blocks.
 * @returns {Promise} Promise that resoves into an object with URLs as keys and fetch results as values.
 */
const fetchAssets = async ( assets ) => {
	return await apiFetch( {
		method: 'POST',
		path: '/fse/v1/sideload/image/batch',
		data: { resources: map( assets ) },
	} ).then( ( response ) =>
		reduce(
			assets,
			( fetched, asset ) => {
				const { id, source_url } = response.shift();
				return {
					...fetched,
					[ asset.url ]: { id, url: source_url },
				};
			},
			{}
		)
	);
};

/**
 * Takes fetched assets and makes sure all their usages will be changed into
 * their new local copies.
 *
 * @param {FetchSession} session A current session.
 * @param {object<string, object>} fetchedAssets Fetched assets.
 * @returns {Array<GutenbergBlock>} A promise resolving into an array of blocks.
 */
const getBlocksWithAppliedAssets = ( session, fetchedAssets ) => {
	forEach( session.assets, ( asset ) => {
		const newAsset = fetchedAssets[ asset.url ];
		if ( ! newAsset ) {
			return;
		}
		forEach( asset.usages, ( usage ) => {
			set( session.blocksByClientId, usage.path, newAsset[ usage.prop ] );
		} );
	} );

	return session.blocks;
};

/**
 * Analyzes blocks and if they use any external assets, ensures they are
 * copied into a local site and are used in blocks instead of the remote ones.
 *
 * @param {Array<GutenbergBlock>} blocks Blocks, as returned by `wp.block.parse`
 * @returns {Promise} A promise that resolves into an array of {@link GutenbergBlock} with updated assets
 */
const ensureAssetsInBlocks = async ( blocks ) => {
	// Create a FetchSession object by reducing blocks.
	const session = reduce( blocks, findAssetsInBlock, {
		assets: {},
		blocksByClientId: {},
		blocks,
	} );

	// No assets found. Proceed with insertion right away.
	if ( isEmpty( session.assets ) ) {
		return blocks;
	}

	// Ensure assets are available on the site and replace originals
	// with local copies before inserting the template.
	return fetchAssets( session.assets ).then( ( fetchedAssets ) => {
		return getBlocksWithAppliedAssets( session, fetchedAssets );
	} );
};

export default ensureAssetsInBlocks;
