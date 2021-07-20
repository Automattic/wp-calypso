import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
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
		keywords: [ 'theme', __( 'theme', 'full-site-editing' ) ],
		description: getTipDescription(
			__(
				'You can visit the <a>theme directory</a> to select a different design for your site.',
				'full-site-editing'
			),
			{
				a: <TipLink section="themes" />,
			},
			__(
				'You can visit the theme directory to select a different design for your site.',
				'full-site-editing'
			)
		),
		permission: 'settings',
	},
	{
		context: 'css',
		keywords: [
			'css',
			__( 'css', 'full-site-editing' ),
			'style',
			__( 'style', 'full-site-editing' ),
		],
		description: getTipDescription(
			__(
				'You can visit the the <a>Customizer</a> to edit the CSS on your site.',
				'full-site-editing'
			),
			{
				a: <TipLink section="customizer" subsection="custom_css" />,
			},
			__( 'You can visit the the Customizer to edit the CSS on your site.', 'full-site-editing' )
		),
		permission: 'settings',
	},
	{
		context: 'plugin',
		keywords: [ 'plugin', __( 'plugin', 'full-site-editing' ) ],
		description: getTipDescription(
			__(
				'You can visit the <a>plugin directory</a> to get started with installing new plugins.',
				'full-site-editing'
			),
			{
				a: <TipLink section="plugins" />,
			},
			__(
				'You can visit the plugin directory to get started with installing new plugins.',
				'full-site-editing'
			)
		),
		permission: 'settings',
	},
	{
		context: 'header',
		keywords: [ 'header', __( 'header', 'full-site-editing' ) ],
		description: getTipDescription(
			__(
				'You can visit the the <a>Customizer</a> to edit your logo and site title.',
				'full-site-editing'
			),
			{
				a: <TipLink section="customizer" subsection="title_tagline" />,
			},
			__(
				'You can visit the the Customizer to edit your logo and site title.',
				'full-site-editing'
			)
		),
		permission: 'settings',
	},
	{
		context: 'color',
		keywords: [ 'color', __( 'color', 'full-site-editing' ) ],
		description: getTipDescription(
			__(
				'You can visit the the <a>Customizer</a> to edit the colors on your site.',
				'full-site-editing'
			),
			{
				a: <TipLink section="customizer" subsection="colors" />,
			},
			__( 'You can visit the the Customizer to edit the colors on your site.', 'full-site-editing' )
		),
		permission: 'settings',
	},
];

export default tips;
