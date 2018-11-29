/** @format */

/**
 * External dependencies
 */
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
//import './editor.scss';
import edit from './edit';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import registerJetpackBlock from '../presets/jetpack/utils/register-jetpack-block';

export const name = 'subscriptions';
export const settings = {
	title: __( 'Subscription form' ),

	description: (
		<Fragment>
			<p>
				{ __( 'A form enabling readers to get notifications when new posts are published from this site.' ) }
			</p>
		</Fragment>
	),

	icon: (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 208 128">
			<rect
				width="198"
				height="118"
				x="5"
				y="5"
				ry="10"
				stroke="currentColor"
				strokeWidth="10"
				fill="none"
			/>
			<path d="M30 98v-68h20l20 25 20-25h20v68h-20v-39l-20 25-20-25v39zM155 98l-30-33h20v-35h20v35h20z" />
		</svg>
	),

	category: 'jetpack',

	keywords: [ __( 'subscribe' ), __( 'subscription' ), __( 'follow' ) ],

	attributes: {
		//The Markdown source is saved in the block content comments delimiter
		subscribe_placeholder: { type: 'string', default: 'Email Address' },
		subscribe_button: { type: 'string', default: 'Subscribe' },
		success_message: {
			type: 'string',
			default:
				"Success! An email was just sent to confirm your subscription. Please find the email now and click 'Confirm Follow' to start subscribing.",
		},
		show_subscribers_total: { type: 'boolean', default: false },
	},
	edit,
	save: () => null,
};

registerJetpackBlock( name, settings );
