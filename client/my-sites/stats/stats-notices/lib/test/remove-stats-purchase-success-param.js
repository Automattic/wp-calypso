/**
 * @jest-environment jsdom
 */
import removeStatsPurchaseSuccessParam from '../remove-stats-purchase-success-param';

describe( 'removeStatsPurchaseSuccessParam', () => {
	it( 'should return the original path if nothing removed', () => {
		expect(
			removeStatsPurchaseSuccessParam(
				'https://wp.com/statsPurchaseSuccess=1/?page=page1&c=d#!/ab/c?e=f'
			)
		).toEqual( 'https://wp.com/statsPurchaseSuccess=1/?page=page1&c=d#!/ab/c?e=f' );
		expect( removeStatsPurchaseSuccessParam( 'https://wp.com/statsPurchaseSuccess=1' ) ).toEqual(
			'https://wp.com/statsPurchaseSuccess=1'
		);
	} );

	it( 'should return the path with the statsPurchaseSuccess in GET params removed', () => {
		expect(
			removeStatsPurchaseSuccessParam( 'https://wp.com/?statsPurchaseSuccess=1&page=page1' )
		).toEqual( 'https://wp.com/?page=page1' );
		expect(
			removeStatsPurchaseSuccessParam( 'https://wp.com/?page=page1&statsPurchaseSuccess=1' )
		).toEqual( 'https://wp.com/?page=page1' );
		expect(
			removeStatsPurchaseSuccessParam( 'https://wp.com/?page=page1&statsPurchaseSuccess=1&c=d' )
		).toEqual( 'https://wp.com/?page=page1&c=d' );
		expect( removeStatsPurchaseSuccessParam( 'https://wp.com/?statsPurchaseSuccess=1' ) ).toEqual(
			'https://wp.com/'
		);
	} );

	it( 'should return the path with the statsPurchaseSuccess in hash removed', () => {
		expect(
			removeStatsPurchaseSuccessParam( 'https://wp.com/?page=page1#!/ab/c?statsPurchaseSuccess=1' )
		).toEqual( 'https://wp.com/?page=page1#!/ab/c' );
		expect(
			removeStatsPurchaseSuccessParam(
				'https://wp.com/?page=page1#!/ab/c?statsPurchaseSuccess=1&d=e'
			)
		).toEqual( 'https://wp.com/?page=page1#!/ab/c?d=e' );
		expect(
			removeStatsPurchaseSuccessParam(
				'https://wp.com/?page=page1#!/ab/c?d=e&statsPurchaseSuccess=1&f=g'
			)
		).toEqual( 'https://wp.com/?page=page1#!/ab/c?d=e&f=g' );
	} );

	it( 'should return the path with the statsPurchaseSuccess in hash and query removed', () => {
		expect(
			removeStatsPurchaseSuccessParam(
				'https://wp.com/?page=page1&statsPurchaseSuccess=1&c=d#!/ab/c?statsPurchaseSuccess=1&e=f'
			)
		).toEqual( 'https://wp.com/?page=page1&c=d#!/ab/c?e=f' );
	} );
} );
