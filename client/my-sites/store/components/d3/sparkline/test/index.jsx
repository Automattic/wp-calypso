import { shallow } from 'enzyme';
import Sparkline from '../index';

describe( 'Sparkline', () => {
	const shallowWithoutLifecycle = ( arg ) => shallow( arg, { disableLifecycleMethods: true } );

	test( 'should allow data to be set.', () => {
		const sparkline = <Sparkline data={ [ 1, 2, 3, 4, 5 ] } />;
		expect( sparkline.props.data ).toEqual( [ 1, 2, 3, 4, 5 ] );
	} );

	test( 'should have sparkline class', () => {
		const sparkline = shallowWithoutLifecycle( <Sparkline data={ [ 1, 2, 3, 4, 5 ] } /> );
		expect( sparkline.find( '.sparkline' ) ).toHaveLength( 1 );
	} );

	test( 'should have className if provided, as well as sparkline class', () => {
		const sparkline = shallowWithoutLifecycle(
			<Sparkline data={ [ 1, 2, 3, 4, 5 ] } className="test__foobar" />
		);
		expect( sparkline.find( '.test__foobar' ) ).toHaveLength( 1 );
		expect( sparkline.find( '.sparkline' ) ).toHaveLength( 1 );
	} );

	test( 'should have a default aspectRatio of 4.5', () => {
		const sparkline = <Sparkline data={ [ 1, 2, 3, 4, 5 ] } />;
		expect( sparkline.props.aspectRatio ).toEqual( 4.5 );
	} );

	test( 'should have a defined aspectRatio if set', () => {
		const sparkline = <Sparkline data={ [ 1, 2, 3, 4, 5 ] } aspectRatio={ 10 } />;
		expect( sparkline.props.aspectRatio ).toEqual( 10 );
	} );

	test( 'should have a default highlightRadius of 3.5', () => {
		const sparkline = <Sparkline data={ [ 1, 2, 3, 4, 5 ] } />;
		expect( sparkline.props.highlightRadius ).toEqual( 3.5 );
	} );

	test( 'should have a defined highlightRadius if set', () => {
		const sparkline = <Sparkline data={ [ 1, 2, 3, 4, 5 ] } highlightRadius={ 10 } />;
		expect( sparkline.props.highlightRadius ).toEqual( 10 );
	} );

	test( 'should have a default margin', () => {
		const sparkline = <Sparkline data={ [ 1, 2, 3, 4, 5 ] } />;
		expect( sparkline.props.margin ).toEqual( { top: 4, right: 4, bottom: 4, left: 4 } );
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
