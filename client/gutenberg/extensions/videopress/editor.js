/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import withVideoPressEdit from './edit';
import withVideoPressSave from './save';
import getJetpackExtensionAvailability from 'gutenberg/extensions/presets/jetpack/utils/get-jetpack-extension-availability';

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

addFilter( 'blocks.registerBlockType', 'gutenberg/extensions/videopress', addVideoPressSupport );
