import { RuleTester } from 'eslint';
import rule from '../no-unsafe-wp-apis';

const ruleTester = new RuleTester( {
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 6,
	},
} );

const options = [ { '@wordpress/package': [ '__experimentalSafe', '__unstableSafe' ] } ];

ruleTester.run( 'no-unsafe-wp-apis', rule, {
	valid: [
		{ code: "import _ from 'lodash';", options },
		{ code: "import { map } from 'lodash';", options },
		{ code: "import { __experimentalFoo } from 'lodash';", options },
		{ code: "import { __unstableFoo } from 'lodash';", options },
		{ code: "import _, { __unstableFoo } from 'lodash';", options },
		{ code: "import * as _ from 'lodash';", options },

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
					type: 'ImportSpecifier',
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
					type: 'ImportSpecifier',
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
					type: 'ImportSpecifier',
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
					type: 'ImportSpecifier',
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
					type: 'ImportSpecifier',
				},
			],
		},
	],
} );
