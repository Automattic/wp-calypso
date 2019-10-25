/**
 * External dependencies
 */
import { NO__ } from '../devtools';
import { BlockConfiguration } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import edit from './edit';

export const name = 'automattic/onboarding';

export interface Attributes {
	align: 'full';
}

export const settings: BlockConfiguration< Attributes > = {
	title: NO__( 'Onboarding' ),
	category: 'layout', // @TODO
	description: NO__( 'Onboarding wizard block' ),
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
