describe( 'Babel preset default', () => {
	async function* foo() {
		await 1;
		yield 2;
	}

	test( 'support for async generator functions', async () => {
		const generator = foo();

		expect( await generator.next() ).toEqual( {
			done: false,
			value: 2,
		} );
	} );
} );
