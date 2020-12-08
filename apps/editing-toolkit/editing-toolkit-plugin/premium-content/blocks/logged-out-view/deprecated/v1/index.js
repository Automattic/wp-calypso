/**
 * WordPress dependencies
 */
// eslint-disable-next-line wpcalypso/import-docblock
import { createBlock } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';

export default {
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

	isEligible: ( { buttonClasses } ) => !! buttonClasses,

	migrate: ( attributes, innerBlocks ) => {
		// Don't migrate if buttons already exist as an innerBlock.
		if ( Array.isArray( innerBlocks ) ) {
			for ( let i = 0; i < innerBlocks.length; i++ ) {
				if ( innerBlocks[ i ].name && innerBlocks[ i ].name === 'premium-content/buttons' ) {
					return [ attributes, [ ...innerBlocks ] ];
				}
			}
		}

		const buttons = createBlock( 'premium-content/buttons', {}, [
			createBlock( 'jetpack/recurring-payments', {
				submitButtonText: attributes.subscribeButtonText,
				backgroundButtonColor: attributes.backgroundButtonColor,
				textButtonColor: attributes.textButtonColor,
				customBackgroundButtonColor: attributes.customBackgroundButtonColor,
				customTextButtonColor: attributes.customTextButtonColor,
			} ),
			createBlock( 'premium-content/login-button', {
				text: attributes.loginButtonText,
				backgroundColor: attributes.backgroundButtonColor,
				textColor: attributes.textButtonColor,
				style: {
					color: {
						background: attributes.customBackgroundButtonColor,
						text: attributes.customTextButtonColor,
					},
				},
			} ),
		] );

		return [ attributes, [ ...innerBlocks, buttons ] ];
	},

	save: () => (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<div className="wp-block-premium-content-logged-out-view">
			<InnerBlocks.Content />
		</div>
	),
};
