/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import TipLink from './tip-link';

function getTipDescription( text, conversion, textFallback ) {
	if ( typeof createInterpolateElement !== 'undefined' ) {
		return createInterpolateElement( text, conversion );
	}

	return textFallback;
}

const tips = [
	{
		context: 'theme',
		keywords: [ 'theme', __( 'theme' ) ],
		description: getTipDescription(
			__( 'You can visit the <a>theme directory</a> to select a different design for your site.' ),
			{
				a: <TipLink section="themes" />,
			},
			__( 'You can visit the theme directory to select a different design for your site.' )
		),
		permission: () => select( 'core' ).canUser( 'create', 'settings' ),
	},
	{
		context: 'css',
		keywords: [ 'css', __( 'css' ), 'style', __( 'style' ) ],
		description: getTipDescription(
			__( 'You can visit the the <a>Customizer</a> to edit the CSS on your site.' ),
			{
				a: <TipLink section="customizer" subsection="custom_css" />,
			},
			__( 'You can visit the the Customizer to edit the CSS on your site.' )
		),
		permission: () => select( 'core' ).canUser( 'create', 'settings' ),
	},
	{
		context: 'plugin',
		keywords: [ 'plugin', __( 'plugin' ) ],
		description: getTipDescription(
			__( 'You can visit the <a>plugin directory</a> to install additional plugins.' ),
			{
				a: <TipLink section="plugins" />,
			},
			__( 'You can visit the plugin directory to install additional plugins.' )
		),
		permission: () => select( 'core' ).canUser( 'create', 'settings' ),
	},
	{
		context: 'header',
		keywords: [ 'header', __( 'header' ) ],
		description: getTipDescription(
			__( 'You can visit the the <a>Customizer</a> to edit your logo and site title.' ),
			{
				a: <TipLink section="customizer" subsection="title_tagline" />,
			},
			__( 'You can visit the the Customizer to edit your logo and site title.' )
		),
		permission: () => select( 'core' ).canUser( 'create', 'settings' ),
	},
	{
		context: 'color',
		keywords: [ 'color', __( 'color' ) ],
		description: getTipDescription(
			__( 'You can visit the the <a>Customizer</a> to edit the colors on your site.' ),
			{
				a: <TipLink section="customizer" subsection="colors" />,
			},
			__( 'You can visit the the Customizer to edit the colors on your site.' )
		),
		permission: () => select( 'core' ).canUser( 'create', 'settings' ),
	},
];

// Pre populate permissions state tree.
tips.forEach( ( { permission } ) => permission() );

export default tips;
