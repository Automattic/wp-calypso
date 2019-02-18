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

	const attributes = {
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
	};

	const edit = withVideoPressEdit( settings.edit );
	const save = withVideoPressSave( settings.save );
	const { available, unavailableReason } = getJetpackExtensionAvailability( 'videopress' );

	if ( available ) {
		return {
			...settings,
			attributes,
			edit,
			save,
			deprecated: [
				{
					attributes: settings.attributes,
					save: settings.save,
					isEligible: attrs => ! attrs.guid,
				},
			],
		};
	}

	if ( [ 'missing_plan', 'missing_module' ].includes( unavailableReason ) ) {
		// If the user downgraded the plan or disabled the module, we mark as deprecated the VideoPress-enhanced video
		// block so the block is migrated to the default core video block.
		return {
			...settings,
			attributes,
			deprecated: [
				{
					attributes,
					save,
				},
			],
		};
	}
};

addFilter( 'blocks.registerBlockType', 'gutenberg/extensions/videopress', addVideoPressSupport );
