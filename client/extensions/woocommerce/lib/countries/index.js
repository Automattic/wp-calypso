/**
 * Internal dependencies
 */
import CA from './CA';
import US from './US';

// Note: We are not using the other state name resources in calypso
// since 1) they do not include Canadian provinces and 2) we will
// want to decorate these objects further in a subsequent PR
// with things like origin vs destination based tax booleans

export default [
	CA(),
	US(),
];
