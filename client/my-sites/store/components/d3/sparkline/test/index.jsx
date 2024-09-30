/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import Sparkline from '../index';

describe( 'Sparkline', () => {
	test( 'should allow data to be set.', () => {
		const sparkline = <Sparkline data={ [ 1, 2, 3, 4, 5 ] } />;
		expect( sparkline.props.data ).toEqual( [ 1, 2, 3, 4, 5 ] );
	} );

	test( 'should have sparkline class', () => {
		const { container } = render( <Sparkline data={ [ 1, 2, 3, 4, 5 ] } /> );

		expect( container ).toMatchSnapshot();
	} );

	test( 'should have className if provided, as well as sparkline class', () => {
		const { container } = render(
			<Sparkline data={ [ 1, 2, 3, 4, 5 ] } className="test__foobar" />
		);

		expect( container ).toMatchSnapshot();
	} );

	test( 'should have a defined aspectRatio if set', () => {
		const sparkline = <Sparkline data={ [ 1, 2, 3, 4, 5 ] } aspectRatio={ 10 } />;
		expect( sparkline.props.aspectRatio ).toEqual( 10 );
	} );

	test( 'should have a defined highlightRadius if set', () => {
		const sparkline = <Sparkline data={ [ 1, 2, 3, 4, 5 ] } highlightRadius={ 10 } />;
		expect( sparkline.props.highlightRadius ).toEqual( 10 );
	} );

	test( 'should have a defined margin if set', () => {
		const sparkline = (
			<Sparkline data={ [ 1, 2, 3, 4, 5 ] } margin={ { top: 1, right: 1, bottom: 1, left: 1 } } />
		);
		expect( sparkline.props.margin ).toEqual( { top: 1, right: 1, bottom: 1, left: 1 } );
	} );

	test( 'should allow maxHeight to be defined.', () => {
		const sparkline = <Sparkline data={ [ 1, 2, 3, 4, 5 ] } maxHeight={ 10 } />;
		expect( sparkline.props.maxHeight ).toEqual( 10 );
	} );

	test( 'should allow highlightIndex to be defined.', () => {
		const sparkline = <Sparkline data={ [ 1, 2, 3, 4, 5 ] } highlightIndex={ 10 } />;
		expect( sparkline.props.highlightIndex ).toEqual( 10 );
	} );
} );
