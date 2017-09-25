/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import Rating from 'components/rating';

describe( '<Rating />', function() {
	describe( 'check props size', function() {
		it( 'should fill in the parent component if no size', function() {
			const wrapper = shallow(
				<Rating />
			);

			const component = wrapper.find( 'div' );
			expect( component.props().style.width ).to.equal( '100%' );
		} );

		it( 'should use size if passed', function() {
			const size = 50,
				wrapper = shallow(
					<Rating
						size={ size }
					/>
				);

			const component = wrapper.find( 'div' );
			expect( component.props().style.width ).to.equal( ( size * 5 ) + 'px' );
		} );
	} );

	describe( 'check props rating', function() {
		it( 'should render 5 spans without rating', function() {
			const wrapper = shallow(
					<Rating />
				);

			const component = wrapper.find( 'span' );
			expect( component.nodes.length ).to.equal( 5 );
			expect( component ).to.have.exactly( 5 ).descendants( '.noticon-rating-empty' );
		} );

		it( 'should render 1.5 stars with rating 30', function() {
			const rating = 30,
				wrapper = shallow(
					<Rating
						rating={ rating }
					/>
				);

			const component = wrapper.find( 'span' );
			expect( component.nodes.length ).to.equal( 5 );
			expect( component ).to.have.exactly( 1 ).descendants( '.noticon-rating-full' );
			expect( component ).to.have.exactly( 1 ).descendants( '.noticon-rating-half' );
			expect( component ).to.have.exactly( 3 ).descendants( '.noticon-rating-empty' );
		} );

		it( 'should use size in each star', function() {
			const rating = 30,
				size = 10,
				wrapper = shallow(
					<Rating
						rating={ rating }
						size={ size }
					/>
				);

			wrapper.find( 'span' ).forEach(
				( node ) => {
					expect( node.props().style.fontSize ).to.equal( size + 'px' );
				}
			);
		} );

		it( 'if no size it should inherit', function() {
			const rating = 30,
				wrapper = shallow(
					<Rating
						rating={ rating
						}
					/>
				);

			wrapper.find( 'span' ).forEach(
				( node ) => {
					expect( node.props().style.fontSize ).to.equal( 'inherit' );
				}
			);
		} );
	} );
} );
