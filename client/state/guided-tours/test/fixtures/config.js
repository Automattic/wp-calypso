/**
 * External dependencies
 */
import { stubTrue } from 'lodash';

/**
 * Internal dependencies
 */
import { isNewUser } from 'calypso/state/guided-tours/contexts';

export const MainTourMeta = {
	name: 'main',
	version: 'test',
	path: '/',
	when: isNewUser,
};

export const ThemesTourMeta = {
	name: 'themes',
	version: 'test',
	path: '/themes',
	when: stubTrue,
};

export const StatsTourMeta = {
	name: 'stats',
	version: 'test',
	path: '/stats',
};

export const TestTourMeta = {
	name: 'test',
	version: 'test',
	path: [ '/test', '/foo' ],
	when: stubTrue,
};

export default {
	main: MainTourMeta,
	themes: ThemesTourMeta,
	stats: StatsTourMeta,
	test: TestTourMeta,
};
