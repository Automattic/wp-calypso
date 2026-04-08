import { __ } from '@wordpress/i18n';
import { createCallback } from './create-callback';
import type { ShowComponentDeps } from './create-callback';
import type { Ability } from '../types';

export type { ShowComponentInput, ShowComponentCallback } from './create-callback';

/**
 * Creates the `show-component` ability definition.
 *
 * Uses `big-sky` name and category to match the backend route configuration.
 * @param getDeps - Returns the latest deps at call time.
 */
export const showComponentAbility = ( getDeps: () => ShowComponentDeps ): Ability => ( {
	name: 'big-sky/show-component',
	label: __( 'Show Component', '__i18n_text_domain__' ),
	category: 'big-sky',
	description: __( 'Display a component in the UI with specified props', '__i18n_text_domain__' ),
	input_schema: {
		type: 'object',
		properties: {
			type: {
				type: 'string',
				description: 'The type of component to show',
				enum: [ 'button-picker', 'font-picker', 'color-picker', 'pattern-picker' ],
			},
			props: {
				type: 'object',
				description: 'The props to pass to the component',
			},
			followUpTasks: {
				type: 'boolean',
				description:
					'Set to true if the user request has to be broken into multiple steps and other tasks remain to be done after this one.',
			},
			zoomOut: {
				type: 'boolean',
				description: 'Whether to zoom out before showing the component',
			},
			clientId: {
				type: 'string',
				description: 'The compressed client ID of the block to target',
			},
			insertIndex: {
				type: 'number',
				description: 'The index at which to insert the component',
			},
			messageId: {
				type: 'string',
				description: 'The assistant message ID for undo support',
			},
		},
		required: [ 'type', 'props' ],
	},
	callback: ( input ) => createCallback( getDeps() )( input ),
} );
