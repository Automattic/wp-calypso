import compareProps from '..';

describe( 'compare-props', () => {
	test( 'should do a shallow comparison when no options are supplied', () => {
		const comparator = compareProps();

		expect( comparator( { a: 1 }, { a: 1 } ) ).toBe( true );
		expect( comparator( { a: 1, extra: 2 }, { a: 1 } ) ).toBe( false );
		expect( comparator( { a: 1 }, { a: 1, extra: 2 } ) ).toBe( false );
		expect( comparator( { a: [] }, { a: [] } ) ).toBe( false );
		const a = { b: 1 };
		expect( comparator( { a }, { a } ) ).toBe( true );
	} );

	test( 'should ignore properties marked as `ignore`', () => {
		const comparator = compareProps( { ignore: [ 'irrelevant' ] } );

		expect(
			comparator( { a: 1, irrelevant: 'whatever1' }, { a: 1, irrelevant: 'whatever2' } )
		).toBe( true );

		expect( comparator( { a: 1, irrelevant: 'whatever1' }, { a: 1 } ) ).toBe( true );

		expect( comparator( { a: 1 }, { a: 1, irrelevant: 'whatever2' } ) ).toBe( true );
	} );

	test( 'should compare selected properties deeply and the remaining ones shallowly', () => {
		const comparator = compareProps( { deep: [ 'query' ] } );

		expect(
			comparator(
				{
					query: { text: 'plugin' },
					page: 2,
				},
				{
					query: { text: 'plugin' },
					page: 2,
				}
			)
		).toBe( true );

		expect(
			comparator(
				{
					query: { text: 'plugin' },
					options: [ 'quick' ],
				},
				{
					query: { text: 'plugin' },
					options: [ 'quick' ],
				}
			)
		).toBe( false );
	} );

	test( 'should ignore properties that are not part of `shallow` list', () => {
		const comparator = compareProps( { shallow: [ 'id' ] } );

		expect( comparator( { id: 1, is_jetpack: true }, { id: 1, is_domain_only: true } ) ).toBe(
			true
		);

		expect( comparator( { is_jetpack: true }, { id: 1, is_domain_only: true } ) ).toBe( false );

		expect( comparator( { id: 1, is_jetpack: true }, { is_domain_only: true } ) ).toBe( false );
	} );

	test( 'should prefer `ignore` list over `deep` and both over `shallow`', () => {
		const comparator = compareProps( {
			ignore: [ 'ignored', 'deep_ignored', 'shallow_ignored' ],
			deep: [ 'deep', 'deep_ignored', 'deep_shallow' ],
			shallow: [ 'shallow', 'shallow_ignored', 'deep_shallow' ],
		} );

		expect(
			comparator(
				{
					ignored: 'whatever1', // ignored
					deep: { a: 'relevant' }, // compared deeply
					deep_ignored: { a: 'whatever1' }, // ignored, deeply inequal
					deep_shallow: { a: 'deep' }, // compared deeply
					shallow: 1, // compared shallowly
					shallow_ignored: { a: 'whatever' }, // ignored
				},
				{
					ignored: 'whatever2',
					deep: { a: 'relevant' },
					deep_ignored: { a: 'whatever2' },
					deep_shallow: { a: 'deep' },
					shallow: 1,
					shallow_ignored: { a: 'whatever' },
				}
			)
		).toBe( true );
	} );
} );
