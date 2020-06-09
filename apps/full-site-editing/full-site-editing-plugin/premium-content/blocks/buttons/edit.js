/**
 * WordPress dependencies
 */
// eslint-disable-next-line wpcalypso/import-docblock
import { __ } from '@wordpress/i18n';
import {
	__experimentalAlignmentHookSettingsProvider as AlignmentHookSettingsProvider,
	InnerBlocks,
	__experimentalBlock as Block,
} from '@wordpress/block-editor';

const ALLOWED_BLOCKS = [ 'core/button', 'premium-content/button' ];
const BUTTONS_TEMPLATE = [
	[
		'premium-content/button',
		{
			text: __( 'Subscribe', 'full-site-editing' ),
			type: 'subscribe',
		},
	],
	[
		'premium-content/button',
		{
			text: __( 'Log In', 'full-site-editing' ),
			type: 'login',
		},
	],
];

// Inside buttons block alignment options are not supported.
const alignmentHooksSetting = {
	isEmbedButton: true,
};

function ButtonsEdit() {
	return (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<Block.div className="wp-block-buttons">
			<AlignmentHookSettingsProvider value={ alignmentHooksSetting }>
				<InnerBlocks
					allowedBlocks={ ALLOWED_BLOCKS }
					template={ BUTTONS_TEMPLATE }
					__experimentalMoverDirection="horizontal"
				/>
			</AlignmentHookSettingsProvider>
		</Block.div>
	);
}

export default ButtonsEdit;
