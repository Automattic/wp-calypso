/**
 * @jest-environment jsdom
 */
jest.mock( 'components/info-popover', () => require( 'components/empty-component' ) );
jest.mock( 'lib/user', () => () => {} );
jest.mock( 'post-editor/editor-term-selector', () => require( 'components/empty-component' ) );

/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { EditorCategoriesTagsAccordion } from 'post-editor/editor-categories-tags/accordion';

describe( 'EditorCategoriesTagsAccordion', function() {
	let accordion;

	function render( postTerms = {} ) {
		accordion = mount(
			<EditorCategoriesTagsAccordion
				siteId={ 777 }
				postTerms={ postTerms }
				postType="post"
				translate={ translate } />
		);
	}

	describe( 'categories+tags subtitle', function() {
		it( 'should display one top-level category name', function() {
			render( {
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
				post_tag: [ 'swawesome' ]
			} );
			expect( accordion.contains( <span className="accordion__subtitle">#swawesome</span> ) ).to.be.true;
		} );

		it( 'should display two tag names', function() {
			render( {
				post_tag: [ 'swawesome', 'another one' ]
			} );
			expect( accordion.contains( <span className="accordion__subtitle">#swawesome, #another one</span> ) ).to.be.true;
		} );

		it( 'should display tag count if more than two', function() {
			render( {
				post_tag: [ 'swawesome', 'another one', 'another one too' ]
			} );
			expect( accordion.contains( <span className="accordion__subtitle">3 tags</span> ) ).to.be.true;
		} );

		it( 'should display category and tag names together', function() {
			render( {
				post_tag: [ 'swawesome', 'another one' ],
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
				post_tag: [ 'swawesome', 'another one' ],
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
				post_tag: [ 'swawesome', 'another one', 'third tag' ],
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
				post_tag: [ 'swawesome', 'another one', 'third tag', 'fourth tag' ],
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
				post_tag: {
					'a &amp; b': {
						name: 'a &amp; b'
					}
				}
			} );
			expect( accordion.contains( <span className="accordion__subtitle">#a & b</span> ) ).to.be.true;
		} );

		it( 'should display categories with ampersands correctly', function() {
			render( {
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
