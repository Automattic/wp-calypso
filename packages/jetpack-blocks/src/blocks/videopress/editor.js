/**
 * External dependencies
 */
import { createBlobURL } from '@wordpress/blob';
import { createBlock } from '@wordpress/blocks';
import { mediaUpload } from '@wordpress/editor';
import { addFilter } from '@wordpress/hooks';
import { every } from 'lodash';

/**
 * Internal dependencies
 */
import withVideoPressEdit from './edit';
import withVideoPressSave from './save';
import getJetpackExtensionAvailability from '../../utils/get-jetpack-extension-availability';

const addVideoPressSupport = ( settings, name ) => {
	if ( 'core/video' !== name ) {
		return settings;
	}

	const { available, unavailableReason } = getJetpackExtensionAvailability( 'videopress' );

	// We customize the video block even if VideoPress it not available so we can support videos that were uploaded to
	// VideoPress if it was available in the past (i.e. before a plan downgrade).
	if ( available || [ 'missing_plan', 'missing_module' ].includes( unavailableReason ) ) {
		return {
			...settings,

			attributes: {
				autoplay: {
					type: 'boolean',
				},
				caption: {
					type: 'string',
					source: 'html',
					selector: 'figcaption',
				},
				controls: {
					type: 'boolean',
					default: true,
				},
				guid: {
					type: 'string',
				},
				id: {
					type: 'number',
				},
				loop: {
					type: 'boolean',
				},
				muted: {
					type: 'boolean',
				},
				poster: {
					type: 'string',
				},
				preload: {
					type: 'string',
					default: 'metadata',
				},
				src: {
					type: 'string',
				},
			},

			transforms: {
				...settings.transforms,
				from: [
					{
						type: 'files',
						isMatch: files => every( files, file => file.type.indexOf( 'video/' ) === 0 ),
						// We define a higher priority (lower number) than the default of 10. This ensures that this
						// transformation prevails over the core video block default transformations.
						priority: 9,
						transform: ( files, onChange ) => {
							const blocks = [];
							files.forEach( file => {
								const block = createBlock( 'core/video', {
									src: createBlobURL( file ),
								} );
								mediaUpload( {
									filesList: [ file ],
									onFileChange: ( [ { id, url } ] ) => {
										onChange( block.clientId, { id, src: url } );
									},
									allowedTypes: [ 'video' ],
								} );
								blocks.push( block );
							} );
							return blocks;
						},
					},
				],
			},

			supports: {
				...settings.supports,
				reusable: false,
			},

			edit: withVideoPressEdit( settings.edit ),

			save: withVideoPressSave( settings.save ),

			deprecated: [
				{
					attributes: settings.attributes,
					save: settings.save,
					isEligible: attrs => ! attrs.guid,
				},
			],
		};
	}

	return settings;
};

addFilter( 'blocks.registerBlockType', 'jetpack/videopress', addVideoPressSupport );
