const { buildPotData } = require( '../src' );

// The base POT data seeds the header block in the empty context / empty msgid
// entry; extracted strings are keyed by context, then by msgid.
const makeBaseData = () => ( {
	charset: 'utf-8',
	headers: { 'content-type': 'text/plain' },
	translations: { '': { '': { msgid: '', msgstr: [ 'content-type: text/plain;\n' ] } } },
} );

describe( 'buildPotData', () => {
	test( 'preserves the base header entry while adding extracted strings', () => {
		const strings = { '': { hello: { msgid: 'hello', msgstr: [ '' ] } } };

		expect( buildPotData( makeBaseData(), strings ) ).toEqual( {
			charset: 'utf-8',
			headers: { 'content-type': 'text/plain' },
			translations: {
				'': {
					'': { msgid: '', msgstr: [ 'content-type: text/plain;\n' ] },
					hello: { msgid: 'hello', msgstr: [ '' ] },
				},
			},
		} );
	} );

	test( 'keeps translations from distinct contexts', () => {
		const strings = {
			'': { hello: { msgid: 'hello', msgstr: [ '' ] } },
			verb: { book: { msgid: 'book', msgctxt: 'verb', msgstr: [ '' ] } },
		};

		const { translations } = buildPotData( makeBaseData(), strings );

		expect( Object.keys( translations ) ).toEqual( [ '', 'verb' ] );
		expect( translations[ '' ] ).toHaveProperty( 'hello' );
		expect( translations[ '' ] ).toHaveProperty( '' ); // header survives
		expect( translations.verb ).toHaveProperty( 'book' );
	} );

	test( 'does not mutate the reused baseData', () => {
		const baseData = makeBaseData();
		const strings = { ctx: { greet: { msgid: 'greet', msgstr: [ '' ] } } };

		buildPotData( baseData, strings );

		expect( baseData ).toEqual( makeBaseData() );
		expect( baseData.translations ).not.toHaveProperty( 'ctx' );
	} );

	test( 'handles empty extracted strings', () => {
		expect( buildPotData( makeBaseData(), {} ) ).toEqual( makeBaseData() );
	} );
} );
