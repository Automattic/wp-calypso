import { RuleTester } from 'eslint';
import plugin from '../../..';

const ruleTester = new RuleTester( {
	languageOptions: {
		sourceType: 'module',
		ecmaVersion: 6,
	},
} );

const options = [ { '@wordpress/package': [ '__experimentalSafe', '__unstableSafe' ] } ];

ruleTester.run( 'no-unsafe-wp-apis', plugin.rules[ 'no-unsafe-wp-apis' ], {
	valid: [
		{ code: "import _ from 'external-module';", options },
		{ code: "import { map } from 'external-module';", options },
		{ code: "import { __experimentalFoo } from 'external-module';", options },
		{ code: "import { __unstableFoo } from 'external-module';", options },
		{ code: "import _, { __unstableFoo } from 'external-module';", options },
		{ code: "import * as _ from 'external-module';", options },

		{ code: "import _ from './x';", options },
		{ code: "import { map } from './x';", options },
		{ code: "import { __experimentalFoo } from './x';", options },
		{ code: "import { __unstableFoo } from './x';", options },
		{ code: "import _, { __unstableFoo } from './x';", options },
		{ code: "import * as _ from './x';", options },

		{ code: "import s from '@wordpress/package';", options },
		{ code: "import { feature } from '@wordpress/package';", options },
		{
			code: "import { __experimentalSafe } from '@wordpress/package';",
			options,
		},
		{
			code: "import { __unstableSafe } from '@wordpress/package';",
			options,
		},
		{
			code: "import { feature, __experimentalSafe } from '@wordpress/package';",
			options,
		},
		{
			code: "import s, { __experimentalSafe } from '@wordpress/package';",
			options,
		},
		{ code: "import * as s from '@wordpress/package';", options },
	],

	invalid: [
		{
			code: "import { __experimentalUnsafe } from '@wordpress/package';",
			options,
			errors: [
				{
					message:
						'Warning: Using `__experimentalUnsafe` from `@wordpress/package` could lead to unexpected issues - experimental and unstable features are prone to future breaking changes.',
				},
			],
		},
		{
			code: "import { __experimentalSafe } from '@wordpress/unsafe';",
			options,
			errors: [
				{
					message:
						'Warning: Using `__experimentalSafe` from `@wordpress/unsafe` could lead to unexpected issues - experimental and unstable features are prone to future breaking changes.',
				},
			],
		},
		{
			code: "import { feature, __experimentalSafe } from '@wordpress/unsafe';",
			options,
			errors: [
				{
					message:
						'Warning: Using `__experimentalSafe` from `@wordpress/unsafe` could lead to unexpected issues - experimental and unstable features are prone to future breaking changes.',
				},
			],
		},
		{
			code: "import s, { __experimentalUnsafe } from '@wordpress/package';",
			options,
			errors: [
				{
					message:
						'Warning: Using `__experimentalUnsafe` from `@wordpress/package` could lead to unexpected issues - experimental and unstable features are prone to future breaking changes.',
				},
			],
		},
		{
			code: "import { __unstableFeature } from '@wordpress/package';",
			options,
			errors: [
				{
					message:
						'Warning: Using `__unstableFeature` from `@wordpress/package` could lead to unexpected issues - experimental and unstable features are prone to future breaking changes.',
				},
			],
		},
	],
} );
