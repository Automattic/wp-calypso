import { actions, prompts } from './constants.js';

const componentGenerator = {
	description: 'Add a new library of React components designed for use in Automattic products.',
	prompts,
	actions: () => [
		...actions,
		{
			type: 'add',
			path: '../{{kebabCase name}}/package.json',
			templateFile: 'templates/component/package.json.hbs',
			abortOnFail: true,
		},
		{
			type: 'add',
			path: '../{{kebabCase name}}/src/index.tsx',
			templateFile: 'templates/component/index.js.hbs',
			abortOnFail: true,
		},
	],
};

export default componentGenerator;
