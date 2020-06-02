/* eslint-disable wpcalypso/import-docblock */
/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
/* eslint-enable wpcalypso/import-docblock */

const deprecated = [
	{
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
		},

		isEligible: ( { subscribeButtonText } ) => !! subscribeButtonText,

		migrate: ( attributes, innerBlocks ) => {
			const subscribeButton = createBlock( 'premium-content/button', {
				type: 'subscribe',
				text: attributes.subscribeButtonText,
			} );
			const loginButton = createBlock( 'premium-content/button', {
				type: 'login',
				text: attributes.loginButtonText,
			} );
			const buttons = createBlock( 'core/buttons', {}, [ subscribeButton, loginButton ] );
			return [ attributes, [ ...innerBlocks, buttons ] ];
		},

		save: () => (
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			<div className="wp-block-premium-content-logged-out-view">
				<InnerBlocks.Content />
			</div>
		),
	},
];

export default deprecated;
