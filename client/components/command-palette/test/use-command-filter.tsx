import { COMMAND_SEPARATOR, useCommandFilter } from '../use-command-filter';

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
} );
