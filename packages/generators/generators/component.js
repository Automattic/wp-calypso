import { actions, prompts } from './constants.js';

const componentGenerator = {
	description: 'Add a component package',
	prompts,
	actions: () => [
		...actions,
		{
			type: 'add',
			path: '../{{kebabCase name}}/src/index.tsx',
			templateFile: 'templates/component/index.js.hbs',
			abortOnFail: true,
		},
	],
};

export default componentGenerator;
