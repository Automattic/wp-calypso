/*import { COMMAND_SEPARATOR, useCommandFilter } from '../use-command-filter';

describe( 'useCommandFilter', () => {
	const commandFilter = useCommandFilter();

	test( 'should return 1 for the exact match before separator', () => {
		const search = 'Manage';
		const beforeSeparator = 'Manage posts';
		const afterSeparator = 'your blog posts';
		const value = beforeSeparator + COMMAND_SEPARATOR + afterSeparator;
		expect( commandFilter( value, search ) ).toBe( 1 );
	} );

	test( 'should return 1 for the exact match despite the case (lower or upper) before separator', () => {
		const search = 'MANAGE';
		const beforeSeparator = 'Manage posts';
		const afterSeparator = 'your blog posts';
		const value = beforeSeparator + COMMAND_SEPARATOR + afterSeparator;
		expect( commandFilter( value, search ) ).toBe( 1 );
	} );

	test( 'should return 1 for the exact match with multiple words before separator', () => {
		const search = 'manage posts';
		const beforeSeparator = 'Manage posts';
		const afterSeparator = 'your blog posts';
		const value = beforeSeparator + COMMAND_SEPARATOR + afterSeparator;
		expect( commandFilter( value, search ) ).toBe( 1 );
	} );

	test( 'should return 0.5 for the exact match after separator', () => {
		const search = 'cache';
		const beforeSeparator = 'Open hosting configuration';
		const afterSeparator = 'cache hosting manage';
		const value = beforeSeparator + COMMAND_SEPARATOR + afterSeparator;
		expect( commandFilter( value, search ) ).toBe( 0.5 );
	} );

	test( 'should return 0.5 for the exact match after separator despite upper or lower case', () => {
		const search = 'CACHE';
		const beforeSeparator = 'Open hosting configuration';
		const afterSeparator = 'cache hosting manage';
		const value = beforeSeparator + COMMAND_SEPARATOR + afterSeparator;
		expect( commandFilter( value, search ) ).toBe( 0.5 );
	} );

	test( 'should return 0 where there is no match either for label or searchLabel', () => {
		const search = 'CACHE';
		const beforeSeparator = 'Open hosting configuration';
		const afterSeparator = 'hosting manage';
		const value = beforeSeparator + COMMAND_SEPARATOR + afterSeparator;
		expect( commandFilter( value, search ) ).toBe( 0 );
	} );
} );*/
