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

export interface Attributes {
	align: string; // TODO: kind of an enum!
	siteTitle: string;
	siteType: string;
	theme: string;
	vertical: string;
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
		siteTitle: {
			type: 'string',
		},
		siteType: {
			type: 'string',
		},
		theme: {
			type: 'string',
		},
		vertical: {
			type: 'string',
		},
	},
	supports: {
		align: [ 'full' ],
		html: false,
	},
	icon: 'universal-access-alt',
	edit,
	save: edit,
};
