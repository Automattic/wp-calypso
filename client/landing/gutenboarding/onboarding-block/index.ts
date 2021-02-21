/**
 * External dependencies
 */
import type { BlockConfiguration } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import type { Attributes } from './types';
import edit from './edit';

export const name = 'automattic/onboarding';

export const settings: BlockConfiguration< Attributes > = {
	title: 'WordPress.com onboarding block',
	category: 'layout',
	description: '',
	attributes: {
		align: {
			type: 'string',
			default: 'full',
		},
	},
	supports: {
		align: [ 'full' ],
		html: false,
		inserter: false,
		multiple: false,
		reusable: false,
	},
	edit,
	save: () => null,
	getEditWrapperProps() {
		return { tabIndex: -1 };
	},
};
