import packageExists from '../utils/packageExists.js';

export const prompts = [
	{
		type: 'input',
		name: 'name',
		message: 'What should it be called?',
		default: '',
		validate: ( value ) => {
			if ( /.+/.test( value ) ) {
				return packageExists( value ) ? 'A package with this name already exists' : true;
			}

			return 'The name is required';
		},
	},
	{
		type: 'input',
		name: 'description',
		message: 'Type a short description',
		default: '',
	},
];

export const actions = [
	{
		type: 'add',
		path: '../{{kebabCase name}}/.eslintrc.js',
		templateFile: 'templates/shared/.eslintrc.js.hbs',
		abortOnFail: true,
	},
	{
		type: 'add',
		path: '../{{kebabCase name}}/jest.config.js',
		templateFile: 'templates/shared/jest.config.js',
		abortOnFail: true,
	},
	{
		type: 'add',
		path: '../{{kebabCase name}}/README.md',
		templateFile: 'templates/shared/README.md.hbs',
		abortOnFail: true,
	},
	{
		type: 'add',
		path: '../{{kebabCase name}}/tsconfig-cjs.json',
		templateFile: 'templates/shared/tsconfig-cjs.json',
		abortOnFail: true,
	},
	{
		type: 'add',
		path: '../{{kebabCase name}}/tsconfig.json',
		templateFile: 'templates/shared/tsconfig.json.hbs',
		abortOnFail: true,
	},
];
