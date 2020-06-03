/**
 * WordPress dependencies
 */
// eslint-disable-next-line wpcalypso/import-docblock
import { createBlock } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';

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

		isEligible: ( { buttonClasses } ) => !! buttonClasses,

		migrate: ( attributes, innerBlocks ) => {
			const createButton = ( type, text ) => {
				return createBlock( 'premium-content/button', {
					type,
					text,
					backgroundColor: attributes.backgroundButtonColor,
					textColor: attributes.textButtonColor,
					style: {
						color: {
							background: attributes.customBackgroundButtonColor,
							text: attributes.customTextButtonColor,
						},
					},
				} );
			};
			const buttons = createBlock( 'core/buttons', {}, [
				createButton( 'subscribe', attributes.subscribeButtonText ),
				createButton( 'login', attributes.loginButtonText ),
			] );
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
