/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';
import { getColorClassName, InnerBlocks } from '@wordpress/block-editor';

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
				const textColor = attributes.textButtonColor;
				const backgroundColor = attributes.backgroundButtonColor;

				const textClass = getColorClassName( 'color', textColor );
				const backgroundClass = getColorClassName( 'background-color', backgroundColor );
				return createBlock( 'premium-content/button', {
					type,
					text,
					className: classnames( textClass, backgroundClass ),
					backgroundColor,
					textColor,
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
