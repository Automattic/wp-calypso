import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import edit from './edit';
import { EventCountdownIcon } from './icon';
import view from './view';

import './editor.scss';
import './style.scss';

registerBlockType( 'jetpack/event-countdown', {
	title: __( 'Event Countdown', 'full-site-editing' ),
	description: __(
		'Count down to your favorite next thing, and celebrate with fireworks when the time is right!',
		'full-site-editing'
	),
	icon: EventCountdownIcon,
	category: 'widgets',
	supports: {
		align: [ 'wide', 'full' ],
	},
	example: {
		attributes: {
			eventTimestamp: 1318874398,
			eventTitle: 'Total Solar Eclipse',
		},
	},
	attributes: {
		eventTitle: {
			type: 'string',
			source: 'text',
			selector: '.event-countdown__event-title',
		},
		eventTimestamp: {
			type: 'number',
		},
	},

	edit: ( props ) => {
		if ( props.isSelected ) {
			return edit( props );
		}
		return view( { ...props, isEditView: true } );
	},
	save: view,
	deprecated: [
		{
			attributes: {
				eventTitle: {
					type: 'string',
					source: 'text',
					selector: '.event-countdown__event-title',
				},
				eventDate: {
					type: 'string',
				},
			},
			// the new `view` function can handle the deprecated attributes
			save: view,
		},
	],
} );
