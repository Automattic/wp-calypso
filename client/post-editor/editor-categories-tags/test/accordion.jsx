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
	let shallow, common, categoryStore, tagStore, i18n, CategoriesTagsAccordion, accordion;

	useMockery();
	useFakeDom();

	before( () => {
		mockery.registerMock( 'post-editor/editor-categories', EmptyComponent );
		mockery.registerMock( 'post-editor/editor-tags', EmptyComponent );
		mockery.registerMock( 'components/info-popover', EmptyComponent );

		shallow = require( 'enzyme' ).shallow;
		common = require( 'lib/terms/test/common' );
		categoryStore = require( 'lib/terms/category-store-factory' )( 'default' );
		tagStore = require( 'lib/terms/tag-store' );
		i18n = require( 'i18n-calypso' );

		CategoriesTagsAccordion = require( 'post-editor/editor-categories-tags/accordion' );
		CategoriesTagsAccordion.prototype.translate = i18n.translate;

		common.dispatchReceiveCategoryTerms();
		common.dispatchReceiveTagTerms();
	} );

	function render( postTaxonomiesProps ) {
		accordion = shallow(
			<CategoriesTagsAccordion
				site={ { ID: common.TEST_SITE_ID } }
				post={ postTaxonomiesProps }
				categories={ categoryStore.all( common.TEST_SITE_ID ) }
				tags={ tagStore.all( common.TEST_SITE_ID ) } />
		).instance();
	}

	describe( 'categories+tags subtitle', function() {
		it( 'should display one top-level category name', function() {
			render( {
				category_ids: [ 1 ],
				tags: []
			} );
			expect( accordion.getSubtitle() ).to.equal( 'a cat' );
		} );

		it( 'should display one child category name', function() {
			render( {
				category_ids: [ 2 ],
				tags: []
			} );
			expect( accordion.getSubtitle() ).to.equal( 'a cat child 1' );
		} );

		it( 'should display category count if more than one', function() {
			render( {
				category_ids: [ 1, 2 ],
				tags: []
			} );
			expect( accordion.getSubtitle() ).to.equal( '2 categories' );
			render( {
				category_ids: [ 1, 2, 3 ],
				tags: []
			} );
			expect( accordion.getSubtitle() ).to.equal( '3 categories' );
		} );

		it( 'should display one tag name', function() {
			render( {
				category_ids: [],
				tags: [ 'swawesome' ]
			} );
			expect( accordion.getSubtitle() ).to.equal( '#swawesome' );
		} );

		it( 'should display two tag names', function() {
			render( {
				category_ids: [],
				tags: [ 'swawesome', 'another one' ]
			} );
			expect( accordion.getSubtitle() ).to.equal( '#swawesome, #another one' );
		} );

		it( 'should display tag count if more than two', function() {
			render( {
				category_ids: [],
				tags: [ 'swawesome', 'another one', 'another one too' ]
			} );
			expect( accordion.getSubtitle() ).to.equal( '3 tags' );
			render( {
				category_ids: [],
				tags: [ 'swawesome', 'another one', 'another one too', 'still more' ]
			} );
			expect( accordion.getSubtitle() ).to.equal( '4 tags' );
		} );

		it( 'should display category and tag names together', function() {
			render( {
				category_ids: [ 1 ],
				tags: [ 'swawesome', 'another one' ]
			} );
			expect( accordion.getSubtitle() ).to.equal( 'a cat, #swawesome, #another one' );
		} );

		it( 'should display child category and tag names together', function() {
			render( {
				category_ids: [ 2 ],
				tags: [ 'swawesome', 'another one' ]
			} );
			expect( accordion.getSubtitle() ).to.equal( 'a cat child 1, #swawesome, #another one' );
		} );

		it( 'should display category counts and tag names together', function() {
			render( {
				category_ids: [ 1, 2, 3 ],
				tags: [ 'swawesome', 'another one' ]
			} );
			expect( accordion.getSubtitle() ).to.equal( '3 categories, #swawesome, #another one' );
		} );

		it( 'should display category names and tag counts together', function() {
			render( {
				category_ids: [ 1 ],
				tags: [ 'swawesome', 'another one', 'third tag' ]
			} );
			expect( accordion.getSubtitle() ).to.equal( 'a cat, 3 tags' );
		} );

		it( 'should display category and tag counts together', function() {
			render( {
				category_ids: [ 1, 2 ],
				tags: [ 'swawesome', 'another one', 'third tag', 'fourth tag' ]
			} );
			expect( accordion.getSubtitle() ).to.equal( '2 categories, 4 tags' );
		} );

		it( 'should display tags with ampersands correctly', function() {
			render( {
				tags: [ 'a &amp; b' ]
			} );
			expect( accordion.getSubtitle() ).to.equal( '#a & b' );
		} );

		it( 'should display categories with ampersands correctly', function() {
			render( {
				category_ids: [ 20 ]
			} );
			expect( accordion.getSubtitle() ).to.equal( 'g & h cat' );
		} );
	} );
} );
