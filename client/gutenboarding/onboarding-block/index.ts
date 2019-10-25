/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { BlockConfiguration } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import edit from './edit';

export const name = 'automattic/onboarding';

export enum SiteType {
	BLOG = 'blog',
	STORE = 'store',
	STORY = 'story',
}

export interface Attributes {
	align: 'full';
}

export const settings: BlockConfiguration< Attributes > = {
	title: __( 'Onboarding' ),
	category: 'layout', // TODO
	description: __( 'Onboarding wizard block' ),
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
	icon: 'universal-access-alt',
	edit,
	save: () => null,
};
