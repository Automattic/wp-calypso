import { renderHook } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import useCouponDiscount from '../use-coupon-discount';

const mockStore = configureStore( [] );
const wrapper = ( discount ) => {
	const store = mockStore( { marketing: { jetpackSaleCoupon: { discount } } } );

	return ( { children } ) => <Provider store={ store }>{ children }</Provider>;
};

describe( 'useCouponDiscount', () => {
	test( 'should return an empty object if original price is not defined', () => {
		const { result } = renderHook( () => useCouponDiscount(), { wrapper: wrapper() } );

		expect( result.current ).toEqual( {} );
	} );

	test( 'should take into account initial discounted price when computing total discount', () => {
		const originalPrice = 100;
		const discountedPrice = 50;
		const couponPercentage = 50;
		const { result } = renderHook( () => useCouponDiscount( originalPrice, discountedPrice ), {
			wrapper: wrapper( couponPercentage ),
		} );

		expect( result.current ).toEqual( {
			price: 25,
			discount: 75,
		} );
	} );
} );
