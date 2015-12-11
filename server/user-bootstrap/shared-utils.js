// These could be rewritten as `export * from`, pending resolution of Babel
// transform bug: http://phabricator.babeljs.io/T2877

import * as sharedUtils from 'lib/user/shared-utils';

export default {
	...sharedUtils
};
