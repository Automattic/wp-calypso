/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';
import { select } from '@wordpress/data';

function tipDescription( text, conversion, textFallback ) {
	if ( createInterpolateElement ) {
		return createInterpolateElement( text, conversion );
	}

	return textFallback;
}

const tips = [
	{
		context: 'theme',
		keywords: [ 'theme', __( 'theme' ) ],
		description: tipDescription(
			__(
				'theme - You can visit the <a>theme directory</a> to select a different design for your site.'
			),
			{
				a: <a href="./themes.php" target="_blank" />,
			},
			__( 'theme - You can visit the theme directory to select a different design for your site.' )
		),
		permission: () => select( 'core' ).canUser( 'create', 'settings' ),
	},
	{
		context: 'css',
		keywords: [ 'css', __( 'css' ), 'style', __( 'style' ) ],
		description: tipDescription(
			__( 'CSS - You can visit the the <a>Customizer</a> to edit the CSS on your site.' ),
			{
				a: <a href="./customize.php?autofocus[section]=custom_css" target="_blank" />,
			},
			__( 'CSS - You can visit the the Customizer to edit the CSS on your site.' )
		),
		permission: () => select( 'core' ).canUser( 'create', 'settings' ),
	},
	{
		context: 'plugin',
		keywords: [ 'plugin', __( 'plugin' ) ],
		description: tipDescription(
			__( 'plugin - You can visit the <a>plugin directory</a> to install additional plugins.' ),
			{
				a: <a href="./plugin-install.php" target="_blank" />,
			},
			__( 'plugin - You can visit the plugin directory to install additional plugins.' )
		),
		permission: () => select( 'core' ).canUser( 'create', 'settings' ),
	},
	{
		context: 'header',
		keywords: [ 'header', __( 'header' ) ],
		description: tipDescription(
			__( 'header - You can visit the the <a>Customizer</a> to edit your logo and site title.' ),
			{
				a: <a href="./customize.php?autofocus[section]=title_tagline" target="_blank" />,
			},
			__( 'header - You can visit the the Customizer to edit your logo and site title.' )
		),
		permission: () => select( 'core' ).canUser( 'create', 'settings' ),
	},
	{
		context: 'colors',
		keywords: [ 'colors', __( 'colors' ) ],
		description: tipDescription(
			__( 'colors - You can visit the the <a>Customizer</a> to edit the colors on your site.' ),
			{
				a: <a href="./customize.php?autofocus[section]=colors" target="_blank" />,
			},
			__( 'colors - You can visit the the Customizer to edit the colors on your site.' )
		),
		permission: () => select( 'core' ).canUser( 'create', 'settings' ),
	},
];

// Pre populate permissions state tree.
tips.forEach( ( { permission } ) => permission() );

export default tips;
