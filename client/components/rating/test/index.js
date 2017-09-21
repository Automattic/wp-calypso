/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
require( 'it-each' )( { testPerIteration: true } );

/**
 * Internal dependencies
 */
import Rating from 'components/rating';

describe( '<Rating />', function() {
	describe( 'check props size', function() {
		it( 'should be set to 24px if no size', function() {
			const wrapper = shallow(
				<Rating />
			);

			const component = wrapper.find( 'div.rating' );
			expect( component.props().style.width ).to.equal( '120px' ); // 24 * 5 = 120;
		} );

		it( 'should use size if passed', function() {
			const size = 48,
				wrapper = shallow(
					<Rating
						size={ size }
					/>
				);

			const component = wrapper.find( 'div.rating' );
			expect( component.props().style.width ).to.equal( ( size * 5 ) + 'px' );
		} );

		it( 'should use size in each star', function() {
			const rating = 30,
				size = 48,
				wrapper = shallow(
					<Rating
						rating={ rating }
						size={ size }
					/>
				);

			wrapper.find( 'svg' ).forEach(
				( node ) => {
					expect( node.props().style.width ).to.equal( size + 'px' );
				}
			);
		} );
	} );

	describe( 'check props rating', function() {
		it( 'should render full width mask for no rating', function() {
			const size = 24, // use default size
				wrapper = shallow(
					<Rating
						size={ size }
					/>
				);

			const component = wrapper.find( 'div.rating__overlay' );
			expect( component.props().style.clipPath ).to.equal( 'inset(0 ' + ( size * 5 ) + 'px 0 0 )' );
			expect( component.props().style.clip ).to.equal( 'rect(0, 0px, ' + size + 'px, 0)' );
		} );

		const ratingList = [ 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 ];
		it.each( ratingList, 'should render rating %s as %s', [ 'element', 'element' ], function( element ) {
			const rating = element,
				size = 24, // use default size
				wrapper = shallow(
					<Rating
						rating={ rating }
						size={ size }
					/>
				);

			const roundRating = Math.round( rating / 10 ) * 10;
			const ratingWidth = ( size * 5 );
			const maskPosition = ( ( roundRating / 100 ) * ratingWidth );
			const clipPathMaskPosition = ( ratingWidth - ( ( roundRating / 100 ) * ratingWidth ) );
			const component = wrapper.find( 'div.rating__overlay' );
			expect( component.props().style.clipPath ).to.equal( 'inset(0 ' + clipPathMaskPosition + 'px 0 0 )' );
			expect( component.props().style.clip ).to.equal( 'rect(0, ' + maskPosition + 'px, ' + size + 'px, 0)' );
		} );
	} );
} );
