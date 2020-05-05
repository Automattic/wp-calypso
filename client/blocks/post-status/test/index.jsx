/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import Gridicon from 'components/gridicon';
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
				expect( wrapper.childAt( 1 ) ).to.have.tagName( 'span' ).to.have.text( 'Sticky' );
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
					expect( wrapper.childAt( 1 ) ).to.have.tagName( 'span' ).to.have.text( 'Pending Review' );
				} );
			} );

			describe( 'future', () => {
				describe( 'showAll', () => {
					test( 'should render the primary components', () => {
						const PostStatusComponent = (
							<PostStatus
								post={ { sticky: false, status: 'future' } }
								showAll
								translate={ identity }
							/>
						);
						const wrapper = shallow( PostStatusComponent );

						expect( wrapper ).to.have.descendants( 'span' );
						expect( wrapper ).to.have.className( 'is-scheduled' );
						expect( wrapper.childAt( 0 ).is( Gridicon ) ).to.be.true;
						expect( wrapper.childAt( 0 ) ).to.have.prop( 'icon', 'calendar' );
						expect( wrapper.childAt( 1 ) ).to.have.tagName( 'span' ).to.have.text( 'Scheduled' );
					} );
				} );

				describe( 'not showAll', () => {
					test( 'should be empty', () => {
						const PostStatusComponent = (
							<PostStatus post={ { sticky: false, status: 'future' } } translate={ identity } />
						);
						const wrapper = shallow( PostStatusComponent );

						expect( wrapper ).to.be.empty;
					} );
				} );
			} );

			describe( 'trash', () => {
				describe( 'showAll', () => {
					test( 'should render the primary components', () => {
						const PostStatusComponent = (
							<PostStatus
								post={ { sticky: false, status: 'trash' } }
								showAll
								translate={ identity }
							/>
						);
						const wrapper = shallow( PostStatusComponent );

						expect( wrapper ).to.have.descendants( 'span' );
						expect( wrapper ).to.have.className( 'is-trash' );
						expect( wrapper.childAt( 0 ).is( Gridicon ) ).to.be.true;
						expect( wrapper.childAt( 0 ) ).to.have.prop( 'icon', 'trash' );
						expect( wrapper.childAt( 1 ) ).to.have.tagName( 'span' ).to.have.text( 'Trashed' );
					} );
				} );

				describe( 'not showAll', () => {
					test( 'should be empty', () => {
						const PostStatusComponent = (
							<PostStatus post={ { sticky: false, status: 'trash' } } translate={ identity } />
						);
						const wrapper = shallow( PostStatusComponent );

						expect( wrapper ).to.be.empty;
					} );
				} );
			} );

			describe( 'draft', () => {
				describe( 'showAll', () => {
					test( 'should render the primary components', () => {
						const PostStatusComponent = (
							<PostStatus
								post={ { sticky: false, status: 'draft' } }
								showAll
								translate={ identity }
							/>
						);
						const wrapper = shallow( PostStatusComponent );

						expect( wrapper ).to.have.descendants( 'span' );
						expect( wrapper ).to.have.className( 'is-draft' );
						expect( wrapper.childAt( 0 ).is( Gridicon ) ).to.be.true;
						expect( wrapper.childAt( 0 ) ).to.have.prop( 'icon', 'aside' );
						expect( wrapper.childAt( 1 ) ).to.have.tagName( 'span' ).to.have.text( 'Draft' );
					} );
				} );

				describe( 'not showAll', () => {
					test( 'should be empty', () => {
						const PostStatusComponent = (
							<PostStatus post={ { sticky: false, status: 'draft' } } translate={ identity } />
						);
						const wrapper = shallow( PostStatusComponent );

						expect( wrapper ).to.be.empty;
					} );
				} );
			} );

			describe( 'publish', () => {
				describe( 'showAll', () => {
					test( 'should render the primary components', () => {
						const PostStatusComponent = (
							<PostStatus
								post={ { sticky: false, status: 'publish' } }
								showAll
								translate={ identity }
							/>
						);
						const wrapper = shallow( PostStatusComponent );

						expect( wrapper ).to.have.descendants( 'span' );
						expect( wrapper ).to.have.className( 'is-published' );
						expect( wrapper.childAt( 0 ).is( Gridicon ) ).to.be.true;
						expect( wrapper.childAt( 0 ) ).to.have.prop( 'icon', 'aside' );
						expect( wrapper.childAt( 1 ) ).to.have.tagName( 'span' ).to.have.text( 'Published' );
					} );
				} );

				describe( 'not showAll', () => {
					test( 'should be empty', () => {
						const PostStatusComponent = (
							<PostStatus post={ { sticky: false, status: 'publish' } } translate={ identity } />
						);
						const wrapper = shallow( PostStatusComponent );

						expect( wrapper ).to.be.empty;
					} );
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
