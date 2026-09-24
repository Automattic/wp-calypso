import { renderPluginRecommendations } from '..';

describe( 'renderPluginRecommendations', () => {
	it( 'preserves trimmed URLs in the result and rendered message', () => {
		const result = renderPluginRecommendations( {
			picks: [
				{
					slug: 'woocommerce',
					why: 'Sell products.',
					url: ' https://wordpress.org/plugins/woocommerce/ ',
				},
			],
		} );
		const picks = [
			{
				slug: 'woocommerce',
				why: 'Sell products.',
				url: 'https://wordpress.org/plugins/woocommerce/',
			},
		];
		expect( result.result.success ).toBe( true );
		expect( result.result.details?.picks ).toEqual( picks );
		expect( JSON.parse( result.agentMessage! ).data.picks ).toEqual( picks );
	} );
	it.each( [ null, false, 123, '', '/plugins/test', 'invalid', 'javascript:alert(1)' ] )(
		'rejects picks with an invalid URL: %p',
		( url ) => {
			const result = renderPluginRecommendations( {
				picks: [ { slug: 'test', why: 'Test', url } ],
			} );
			expect( result.result.success ).toBe( false );
			expect( result.agentMessage ).toBeUndefined();
		}
	);
	it.each( [
		null,
		false,
		'picks',
		{},
		{ picks: {} },
		{ picks: [ null, {}, { slug: '../bad', why: 'No' }, { slug: 'valid', why: false } ] },
		{ picks: Array( 11 ).fill( { slug: 'test', why: 'Test' } ) },
	] )( 'rejects invalid input: %p', ( input ) => {
		const result = renderPluginRecommendations( input );
		expect( result.result.success ).toBe( false );
		expect( result.agentMessage ).toBeUndefined();
	} );
	it( 'normalizes and deduplicates picks in order and persists explanations and catalogs', () => {
		const result = renderPluginRecommendations( {
			picks: [
				{ slug: ' WooCommerce ', why: ' Sell products. ', source: 'wporg' },
				{ slug: 'woocommerce', why: 'Duplicate' },
				{ slug: 'premium', why: 'Premium features.', source: 'commercial' },
				{ slug: 'unknown', why: 'Look in both catalogs.' },
				{ slug: 'invalid', why: 'Bad catalog', source: 'other' },
			],
		} );
		expect( result.result.success ).toBe( true );
		expect( result.result.error ).toBeUndefined();
		expect( JSON.parse( result.agentMessage! ).data.picks ).toEqual( [
			{ slug: 'woocommerce', why: 'Sell products.', source: 'wporg' },
			{ slug: 'premium', why: 'Premium features.', source: 'commercial' },
			{ slug: 'unknown', why: 'Look in both catalogs.' },
		] );
	} );
} );
