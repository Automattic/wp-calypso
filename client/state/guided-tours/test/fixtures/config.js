import { isNewUser } from 'calypso/state/guided-tours/contexts';

const stubTrue = () => true;

export default [
	{
		name: 'main',
		version: 'test',
		path: '/',
		when: isNewUser,
	},
	{
		name: 'themes',
		version: 'test',
		path: '/themes',
		when: stubTrue,
	},
	{
		name: 'stats',
		version: 'test',
		path: '/stats',
	},
	{
		name: 'test',
		version: 'test',
		path: [ '/test', '/foo' ],
		when: stubTrue,
	},
];
