/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';

/**
 * WordPress dependencies
 */
import { compose, ifCondition } from '@wordpress/compose';
import { withSelect, select, subscribe } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { registerFormatType, unregisterFormatType } from '@wordpress/rich-text';

const name = 'premium-content/logged-out-view';
const category = 'common';
/**
 * @typedef {Object} Attributes
 * @property {string} subscribeButtonText
 * @property {string} loginButtonText
 * @property {string} buttonClasses
 * @property {string} backgroundButtonColor
 * @property {string} textButtonColor
 * @property {string} customBackgroundButtonColor
 * @property {string} customTextButtonColor
 *
 * @typedef {import('@wordpress/blocks').BlockConfiguration<Attributes>} BlockConfiguration
 * @type {BlockConfiguration}
 */
const settings = {
	name,
	category,
	attributes: {
		subscribeButtonText: {
			type: 'string',
			default: 'Subscribe',
		},
		loginButtonText: {
			type: 'string',
			default: 'Log In',
		},
		buttonClasses: {
			type: 'string',
			default: '',
		},
		backgroundButtonColor: {
			type: 'string',
			default: '',
		},
		textButtonColor: {
			type: 'string',
			default: '',
		},
		customBackgroundButtonColor: {
			type: 'string',
			default: '',
		},
		customTextButtonColor: {
			type: 'string',
			default: '',
		},
		'premium-content/container/selectedPlanId': {
			type: 'number',
			default: 0,
		},
	},

	/* translators: block name */
	title: __( 'Logged Out View', 'premium-content' ),
	/* translators: block description */
	description: __( 'Logged Out View.', 'premium-content' ),
	parent: [ 'premium-content/container' ],
	supports: {
		// Hide this block from the inserter.
		inserter: false,
		html: false,
	},
	edit,
	save,
	context: [ 'premium-content/container/selectedPlanId' ],
};

/**
 * Modify the rich text link button to not be enabled on the logged-in view (This is visible when the block is selected
 * (including when the buttons are selected).
 *
 * This gets wrapped in `subscribe` to return an unsubscribe function which we can call to unregister the function after
 * the rich text data is defined.
 */
// @ts-ignore
const unsubscribe = subscribe( () => {
	// Keep running until the 'core/link' format is defined
	const linkFormat = select( 'core/rich-text' ).getFormatType( 'core/link' );
	if ( ! linkFormat ) {
		return;
	}
	// It's defined so we can stop after this iteration...
	// @ts-ignore
	unsubscribe();

	unregisterFormatType( 'core/link' );

	// Use the existing link button functionality but limit it so that it doesn't run inside this view.
	const newLinkButton = compose(
		withSelect( ( composeSelect ) => {
			return {
				selectedBlock: composeSelect( 'core/block-editor' ).getSelectedBlock(),
			};
		} ),
		// @ts-ignore
		ifCondition( ( props ) => {
			// @ts-ignore
			return props.selectedBlock && props.selectedBlock.name !== name;
		} )
		// @ts-ignore
	)( linkFormat.edit );

	// Overwrite the previous 'core/link' so others can extend
	registerFormatType( 'core/link', {
		...linkFormat,
		// @ts-ignore
		edit: newLinkButton,
	} );
} );

export { name, category, settings };
