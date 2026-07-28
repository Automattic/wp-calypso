import mergeGlobalStyles from '../merge-global-styles';

describe( 'mergeGlobalStyles', () => {
	it( 'deep-merges nested objects', () => {
		const merged = mergeGlobalStyles(
			{ color: { text: '#000', background: '#fff' } },
			{ color: { text: '#111' } }
		);

		expect( merged ).toEqual( { color: { text: '#111', background: '#fff' } } );
	} );

	it( 'replaces arrays wholesale', () => {
		const merged = mergeGlobalStyles( { palette: [ 'a', 'b' ] }, { palette: [ 'c' ] } );

		expect( merged ).toEqual( { palette: [ 'c' ] } );
	} );

	it( 'replaces `border` objects wholesale', () => {
		const merged = mergeGlobalStyles(
			{ border: { radius: '4px', color: 'red' } },
			{ border: { radius: '8px' } }
		);

		expect( merged ).toEqual( { border: { radius: '8px' } } );
	} );
} );
