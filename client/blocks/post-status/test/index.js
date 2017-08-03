/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import identity from 'lodash/identity';
import Gridicon from 'gridicons';

describe( 'PostStatus', ( ) => {
	let PostStatus;

	before( ( ) => {
		PostStatus = require( '..' ).PostStatus;
	} );

	context( 'no post', ( ) => {
		it( 'should be empty', ( ) => {
			const PostStatusComponent = ( <PostStatus translate={ identity } /> );
			const wrapper = shallow( PostStatusComponent );

			expect( wrapper ).to.be.empty;
		} );
	} );

	context( 'post', ( ) => {
		context( 'sticky', ( ) => {
			it( 'should render the primary components', ( ) => {
				const PostStatusComponent = ( <PostStatus post={ { sticky: true } } translate={ identity } /> );
				const wrapper = shallow( PostStatusComponent );

				expect( wrapper ).to.have.descendants( 'span' );
				expect( wrapper ).to.have.className( 'is-sticky' );
				expect( wrapper.childAt( 0 ).is( Gridicon ) ).to.be.true;
				expect( wrapper.childAt( 0 ) ).to.have.prop( 'icon', 'bookmark-outline' );
				expect( wrapper.childAt( 1 ) ).to.have.tagName( 'span' ).to.have.text( 'Sticky' );
			} );
		} );

		context( 'not sticky', ( ) => {
			context( 'pending', ( ) => {
				it( 'should render the primary components', ( ) => {
					const PostStatusComponent = ( <PostStatus post={ { sticky: false, status: 'pending' } } translate={ identity } /> );
					const wrapper = shallow( PostStatusComponent );

					expect( wrapper ).to.have.descendants( 'span' );
					expect( wrapper ).to.have.className( 'is-pending' );
					expect( wrapper.childAt( 0 ).is( Gridicon ) ).to.be.true;
					expect( wrapper.childAt( 0 ) ).to.have.prop( 'icon', 'aside' );
					expect( wrapper.childAt( 1 ) ).to.have.tagName( 'span' ).to.have.text( 'Pending Review' );
				} );
			} );

			context( 'future', ( ) => {
				it( 'should render the primary components', ( ) => {
					const PostStatusComponent = ( <PostStatus post={ { sticky: false, status: 'future' } } translate={ identity } /> );
					const wrapper = shallow( PostStatusComponent );

					expect( wrapper ).to.have.descendants( 'span' );
					expect( wrapper ).to.have.className( 'is-scheduled' );
					expect( wrapper.childAt( 0 ).is( Gridicon ) ).to.be.true;
					expect( wrapper.childAt( 0 ) ).to.have.prop( 'icon', 'calendar' );
					expect( wrapper.childAt( 1 ) ).to.have.tagName( 'span' ).to.have.text( 'Scheduled' );
				} );
			} );

			context( 'trash', ( ) => {
				it( 'should render the primary components', ( ) => {
					const PostStatusComponent = ( <PostStatus post={ { sticky: false, status: 'trash' } } translate={ identity } /> );
					const wrapper = shallow( PostStatusComponent );

					expect( wrapper ).to.have.descendants( 'span' );
					expect( wrapper ).to.have.className( 'is-trash' );
					expect( wrapper.childAt( 0 ).is( Gridicon ) ).to.be.true;
					expect( wrapper.childAt( 0 ) ).to.have.prop( 'icon', 'trash' );
					expect( wrapper.childAt( 1 ) ).to.have.tagName( 'span' ).to.have.text( 'Trashed' );
				} );
			} );

			context( 'unhandled status', ( ) => {
				it( 'should be empty', ( ) => {
					const PostStatusComponent = ( <PostStatus post={ { sticky: false, status: 'wow' } } translate={ identity } /> );
					const wrapper = shallow( PostStatusComponent );

					expect( wrapper ).to.be.empty;
				} );
			} );
		} );
	} );
} );
