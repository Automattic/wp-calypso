/**
 * External dependencies
 */
import React from 'react';
import mockery from 'mockery';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import EmptyComponent from 'test/helpers/react/empty-component';
import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'EditorCategoriesTagsAccordion', function() {
	let mount, common, tagStore, i18n, accordion, EditorCategoriesTagsAccordion;

	useMockery();
	useFakeDom();

	before( () => {
		mockery.registerMock( 'post-editor/editor-term-selector', EmptyComponent );
		mockery.registerMock( 'post-editor/editor-tags', EmptyComponent );
		mockery.registerMock( 'components/info-popover', EmptyComponent );
		mockery.registerMock( 'react-virtualized/VirtualScroll', EmptyComponent );

		mount = require( 'enzyme' ).mount;
		common = require( 'lib/terms/test/common' );
		tagStore = require( 'lib/terms/tag-store' );
		i18n = require( 'i18n-calypso' );

		// require needs to be here in order for mocking of VirtualScroll to work
		EditorCategoriesTagsAccordion = require ( 'post-editor/editor-categories-tags/accordion' ).EditorCategoriesTagsAccordion;

		common.dispatchReceiveTagTerms();
	} );

	function render( postTaxonomiesProps, postTerms = {} ) {
		accordion = mount(
			<EditorCategoriesTagsAccordion
				site={ { ID: common.TEST_SITE_ID } }
				post={ postTaxonomiesProps }
				postTerms={ postTerms }
				postType="post"
				translate={ i18n.translate }
				tags={ tagStore.all( common.TEST_SITE_ID ) } />
		);
	}

	describe( 'categories+tags subtitle', function() {
		it( 'should display one top-level category name', function() {
			render( {
				tags: []
			}, {
				category: {
					cat: {
						name: 'cat'
					}
				}
			} );
			expect( accordion.contains( <span className="accordion__subtitle">cat</span> ) ).to.be.true;
		} );

		it( 'should display category count if more than one', function() {
			render( {
				tags: []
			}, {
				category: {
					cat: {
						name: 'cat'
					},
					chewbacca: {
						name: 'chewbacca'
					}
				}
			} );
			expect( accordion.contains( <span className="accordion__subtitle">2 categories</span> ) ).to.be.true;
		} );

		it( 'should display one tag name', function() {
			render( {
				tags: [ 'swawesome' ]
			} );
			expect( accordion.contains( <span className="accordion__subtitle">#swawesome</span> ) ).to.be.true;
		} );

		it( 'should display two tag names', function() {
			render( {
				tags: [ 'swawesome', 'another one' ]
			} );
			expect( accordion.contains( <span className="accordion__subtitle">#swawesome, #another one</span> ) ).to.be.true;
		} );

		it( 'should display tag count if more than two', function() {
			render( {
				tags: [ 'swawesome', 'another one', 'another one too' ]
			} );
			expect( accordion.contains( <span className="accordion__subtitle">3 tags</span> ) ).to.be.true;
		} );

		it( 'should display category and tag names together', function() {
			render( {
				tags: [ 'swawesome', 'another one' ]
			}, {
				category: {
					cat: {
						name: 'cat'
					}
				}
			} );
			expect( accordion.contains( <span className="accordion__subtitle">cat, #swawesome, #another one</span> ) ).to.be.true;
		} );

		it( 'should display category counts and tag names together', function() {
			render( {
				tags: [ 'swawesome', 'another one' ]
			}, {
				category: {
					cat: {
						name: 'cat'
					},
					sampson: {
						name: 'sampson'
					},
					kipper: {
						name: 'kipper'
					}
				}
			} );
			expect( accordion.contains( <span className="accordion__subtitle">3 categories, #swawesome, #another one</span> ) ).to.be.true;
		} );

		it( 'should display category names and tag counts together', function() {
			render( {
				tags: [ 'swawesome', 'another one', 'third tag' ]
			}, {
				category: {
					cat: {
						name: 'cat'
					}
				}
			} );
			expect( accordion.contains( <span className="accordion__subtitle">cat, 3 tags</span> ) ).to.be.true;
		} );

		it( 'should display category and tag counts together', function() {
			render( {
				tags: [ 'swawesome', 'another one', 'third tag', 'fourth tag' ]
			}, {
				category: {
					cat: {
						name: 'cat'
					},
					sampson: {
						name: 'sampson'
					},
					kipper: {
						name: 'kipper'
					}
				}
			} );
			expect( accordion.contains( <span className="accordion__subtitle">3 categories, 4 tags</span> ) ).to.be.true;
		} );

		it( 'should display tags with ampersands correctly', function() {
			render( {
				tags: [ 'a &amp; b' ]
			} );
			expect( accordion.contains( <span className="accordion__subtitle">#a & b</span> ) ).to.be.true;
		} );

		it( 'should display categories with ampersands correctly', function() {
			render( {}, {
				category: {
					'cats &amp; dogs': {
						name: 'cats &amp; dogs'
					}
				}
			} );
			expect( accordion.contains( <span className="accordion__subtitle">cats & dogs</span> ) ).to.be.true;
		} );
	} );
} );
