import calypso from '@automattic/calypso-eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig( [
	...calypso( import.meta.dirname ),
	{
		files: [ '**/*.{js.jsx,ts,tsx}' ],
		rules: {
			'wpcalypso/no-unsafe-wp-apis': [
				'warn',
				{
					'@wordpress/block-editor': [ '__unstableIframe', '__unstableEditorStyles' ],
					'@wordpress/components': [
						'__experimentalHStack',
						'__experimentalVStack',
						'__unstableComposite',
						'__unstableCompositeItem',
						'__unstableMotion',
						'__unstableUseCompositeState',
					],
				},
			],
		},
	},
] );
