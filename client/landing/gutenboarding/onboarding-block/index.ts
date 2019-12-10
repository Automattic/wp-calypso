/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { BlockConfiguration } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import edit from './edit';
import { Steps } from '../types';

export const name = 'automattic/onboarding';

export interface Attributes {
	align: 'full';
	step: Steps;
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
		step: {
			type: 'number',
			default: Steps.IntentGathering,
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
