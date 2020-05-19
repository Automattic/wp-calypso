/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { each } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import Rating from 'components/rating';

describe( '<Rating />', () => {
	describe( 'check props size', () => {
		test( 'should be set to 24px if no size', () => {
			const wrapper = shallow( <Rating /> );

			const component = wrapper.find( 'div.rating' );
			expect( component.props().style.width ).to.equal( '120px' ); // 24 * 5 = 120;
		} );

		test( 'should use size if passed', () => {
			const size = 48,
				wrapper = shallow( <Rating size={ size } /> );

			const component = wrapper.find( 'div.rating' );
			expect( component.props().style.width ).to.equal( size * 5 + 'px' );
		} );

		test( 'should use size in each star', () => {
			const rating = 30,
				size = 48,
				wrapper = shallow( <Rating rating={ rating } size={ size } /> );

			wrapper.find( 'svg' ).forEach( ( node ) => {
				expect( node.props().style.width ).to.equal( size + 'px' );
			} );
		} );
	} );

	describe( 'check props rating', () => {
		test( 'should render full width mask for no rating', () => {
			const size = 24, // use default size
				wrapper = shallow( <Rating size={ size } /> );

			const component = wrapper.find( 'div.rating__overlay' );
			expect( component.props().style.clipPath ).to.equal( 'inset(0 ' + size * 5 + 'px 0 0 )' );
			expect( component.props().style.clip ).to.equal( 'rect(0, 0px, ' + size + 'px, 0)' );
		} );

		test( 'should render rating clipping mask properly', () => {
			each( [ 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 ], function ( ratingValue ) {
				const size = 24; // use default size
				const wrapper = shallow( <Rating rating={ ratingValue } size={ size } /> );

				const roundRating = Math.round( ratingValue / 10 ) * 10;
				const ratingWidth = size * 5;
				const maskPosition = ( roundRating / 100 ) * ratingWidth;
				const clipPathMaskPosition = ratingWidth - ( roundRating / 100 ) * ratingWidth;
				const component = wrapper.find( 'div.rating__overlay' );
				expect( component.props().style.clipPath ).to.equal(
					'inset(0 ' + clipPathMaskPosition + 'px 0 0 )'
				);
				expect( component.props().style.clip ).to.equal(
					'rect(0, ' + maskPosition + 'px, ' + size + 'px, 0)'
				);
			} );
		} );
	} );
} );
