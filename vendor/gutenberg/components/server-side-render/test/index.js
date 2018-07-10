import { rendererPathWithAttributes } from '../index';

describe( 'blockPathWithAttributes', function() {
	test( 'should return an base path for empty input', function() {
		expect( rendererPathWithAttributes( 'core/test-block', null ) ).toBe( '/gutenberg/v1/block-renderer/core/test-block?context=edit' );
		expect( rendererPathWithAttributes( 'core/test-block' ) ).toBe( '/gutenberg/v1/block-renderer/core/test-block?context=edit' );
	} );

	test( 'should format basic url params ', function() {
		expect(
			rendererPathWithAttributes( 'core/test-block', {
				stringArg: 'test',
				nullArg: null,
				emptyArg: '',
				numberArg: 123,
			} )
		).toBe(
			'/gutenberg/v1/block-renderer/core/test-block?context=edit&attributes%5BstringArg%5D=test&attributes%5BnullArg%5D=&attributes%5BemptyArg%5D=&attributes%5BnumberArg%5D=123',
		);
	} );

	test( 'should format object params ', function() {
		expect(
			rendererPathWithAttributes( 'core/test-block', {
				objectArg: {
					stringProp: 'test',
					numberProp: 123,
				},
			} )
		).toBe(
			'/gutenberg/v1/block-renderer/core/test-block?context=edit&attributes%5BobjectArg%5D%5BstringProp%5D=test&attributes%5BobjectArg%5D%5BnumberProp%5D=123',
		);
	} );

	test( 'should format an array of objects', function() {
		expect(
			rendererPathWithAttributes( 'core/test-block', {
				children: [
					{
						name: 'bobby',
						age: 12,
						sex: 'M',
					},
					{
						name: 'sally',
						age: 8,
						sex: 'F',
					},
				],
			} )
		).toBe(
			'/gutenberg/v1/block-renderer/core/test-block?context=edit&attributes%5Bchildren%5D%5B0%5D%5Bname%5D=bobby&attributes%5Bchildren%5D%5B0%5D%5Bage%5D=12&attributes%5Bchildren%5D%5B0%5D%5Bsex%5D=M&attributes%5Bchildren%5D%5B1%5D%5Bname%5D=sally&attributes%5Bchildren%5D%5B1%5D%5Bage%5D=8&attributes%5Bchildren%5D%5B1%5D%5Bsex%5D=F',
		);
	} );
} );
