import { translate, translateResultToString } from '../src';

describe( 'translateResultToString', function () {
	it( 'should return an empty string if param is not a translate result', function () {
		expect( translateResultToString( {} ) ).toBe( '' );
	} );

	it( 'should return a string if text has no markup', function () {
		expect( translateResultToString( translate( 'Lorem ipsum' ) ) ).toBe( 'Lorem ipsum' );
	} );

	it( 'should return a string equivalent if text has markup', function () {
		const opts = {
			components: { em: <em />, storage: <span>10GB</span> },
		};

		const t = translate( 'VaultPress Backup {{em}}Daily{{/em}} {{storage/}}', opts );

		expect( translateResultToString( t ) ).toBe( 'VaultPress Backup Daily 10GB' );
	} );
} );
