/* eslint-disable vars-on-top */
require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react/addons' ),
	ReactInjection = require( 'react/lib/ReactInjection' ),
	mockery = require( 'mockery' ),
	expect = require( 'chai' ).expect,
	TestUtils = React.addons.TestUtils;

/**
 * Internal dependencies
 */
var common = require( 'lib/terms/test/common' ),
	CategoryListData = require( 'components/data/category-list-data' ),
	TagListData = require( 'components/data/tag-list-data' ),
	i18n = require( 'lib/mixins/i18n' ),
	TaxonomiesAccordion;

var MOCK_COMPONENT = React.createClass( {
	render: function() {
		return null;
	}
} );

mockery.enable( {
	warnOnReplace: false,
	warnOnUnregistered: false
} );

mockery.registerMock( 'components/info-popover', MOCK_COMPONENT );
mockery.registerSubstitute( 'matches-selector', 'component-matches-selector' );
mockery.registerSubstitute( 'query', 'component-query' );
i18n.initialize();
ReactInjection.Class.injectMixin( i18n.mixin );
TaxonomiesAccordion = require( 'post-editor/editor-taxonomies/accordion' );
common.dispatchReceiveCategoryTerms();

describe( 'EditorTaxonomiesAccordion', function() {
	var accordion, wrapper;

	function render( postTaxonomiesProps ) {
		unmount();
		wrapper = ReactDom.render(
			<CategoryListData siteId={ common.TEST_SITE_ID }>
				<TagListData siteId={ common.TEST_SITE_ID }>
					<TaxonomiesAccordion
						site={ { ID: common.TEST_SITE_ID } }
						post={ postTaxonomiesProps }
					/>
				</TagListData>
			</CategoryListData>,
			document.body
		);
		accordion = TestUtils.scryRenderedComponentsWithType( wrapper, TaxonomiesAccordion )[0];
	}

	function unmount() {
		if ( wrapper ) {
			ReactDom.unmountComponentAtNode( document.body );
			wrapper = null;
		}
	}

	afterEach( unmount );

	describe( 'taxonomies subtitle', function() {
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
