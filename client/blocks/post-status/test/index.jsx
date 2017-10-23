/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import Gridicon from 'gridicons';
import { identity } from 'lodash';
import React from 'react';

describe( 'PostStatus', () => {
	let PostStatus;

	beforeAll( () => {
		PostStatus = require( '..' ).PostStatus;
	} );

	describe( 'no post', () => {
		test( 'should be empty', () => {
			const PostStatusComponent = <PostStatus translate={ identity } />;
			const wrapper = shallow( PostStatusComponent );

			expect( wrapper ).to.be.empty;
		} );
	} );

	describe( 'post', () => {
		describe( 'sticky', () => {
			test( 'should render the primary components', () => {
				const PostStatusComponent = <PostStatus post={ { sticky: true } } translate={ identity } />;
				const wrapper = shallow( PostStatusComponent );

				expect( wrapper ).to.have.descendants( 'span' );
				expect( wrapper ).to.have.className( 'is-sticky' );
				expect( wrapper.childAt( 0 ).is( Gridicon ) ).to.be.true;
				expect( wrapper.childAt( 0 ) ).to.have.prop( 'icon', 'bookmark-outline' );
				expect( wrapper.childAt( 1 ) )
					.to.have.tagName( 'span' )
					.to.have.text( 'Sticky' );
			} );
		} );

		describe( 'not sticky', () => {
			describe( 'pending', () => {
				test( 'should render the primary components', () => {
					const PostStatusComponent = (
						<PostStatus post={ { sticky: false, status: 'pending' } } translate={ identity } />
					);
					const wrapper = shallow( PostStatusComponent );

					expect( wrapper ).to.have.descendants( 'span' );
					expect( wrapper ).to.have.className( 'is-pending' );
					expect( wrapper.childAt( 0 ).is( Gridicon ) ).to.be.true;
					expect( wrapper.childAt( 0 ) ).to.have.prop( 'icon', 'aside' );
					expect( wrapper.childAt( 1 ) )
						.to.have.tagName( 'span' )
						.to.have.text( 'Pending Review' );
				} );
			} );

			describe( 'future', () => {
				test( 'should render the primary components', () => {
					const PostStatusComponent = (
						<PostStatus post={ { sticky: false, status: 'future' } } translate={ identity } />
					);
					const wrapper = shallow( PostStatusComponent );

					expect( wrapper ).to.have.descendants( 'span' );
					expect( wrapper ).to.have.className( 'is-scheduled' );
					expect( wrapper.childAt( 0 ).is( Gridicon ) ).to.be.true;
					expect( wrapper.childAt( 0 ) ).to.have.prop( 'icon', 'calendar' );
					expect( wrapper.childAt( 1 ) )
						.to.have.tagName( 'span' )
						.to.have.text( 'Scheduled' );
				} );
			} );

			describe( 'trash', () => {
				test( 'should render the primary components', () => {
					const PostStatusComponent = (
						<PostStatus post={ { sticky: false, status: 'trash' } } translate={ identity } />
					);
					const wrapper = shallow( PostStatusComponent );

					expect( wrapper ).to.have.descendants( 'span' );
					expect( wrapper ).to.have.className( 'is-trash' );
					expect( wrapper.childAt( 0 ).is( Gridicon ) ).to.be.true;
					expect( wrapper.childAt( 0 ) ).to.have.prop( 'icon', 'trash' );
					expect( wrapper.childAt( 1 ) )
						.to.have.tagName( 'span' )
						.to.have.text( 'Trashed' );
				} );
			} );

			describe( 'unhandled status', () => {
				test( 'should be empty', () => {
					const PostStatusComponent = (
						<PostStatus post={ { sticky: false, status: 'wow' } } translate={ identity } />
					);
					const wrapper = shallow( PostStatusComponent );

					expect( wrapper ).to.be.empty;
				} );
			} );
		} );
	} );
} );
