require( 'lib/react-test-env-setup' )();

/**
 * External Dependencies
 */
var	sinon = require( 'sinon' ),
	sinonChai = require( 'sinon-chai' ),
	ReactDom = require( 'react-dom' ),
	React = require( 'react/addons' ),
	TestUtils = React.addons.TestUtils,
	chai = require( 'chai' );

/**
 * Internal Dependencies
 */
var DomainSuggestion = require( 'components/domains/domain-suggestion' ),
	DomainProductPrice = require( 'components/domains/domain-product-price' );

chai.use( sinonChai );

describe( 'Domain Suggestion', function() {
	beforeEach( function() {
		DomainSuggestion.prototype.__reactAutoBindMap.translate = sinon.stub();
		DomainProductPrice.prototype.__reactAutoBindMap.translate = sinon.stub();
	} );

	afterEach( function() {
		delete DomainSuggestion.prototype.__reactAutoBindMap.translate;
		delete DomainProductPrice.prototype.__reactAutoBindMap.translate;
	} );

	describe( 'added domain', function() {
		it( 'should show a checkbox when in cart', function() {
			var suggestionComponent = TestUtils.renderIntoDocument( <DomainSuggestion isAdded={true} /> );

			chai.expect( suggestionComponent.refs.checkmark ).to.exist;
		} );

		it( 'should show the button label when not in cart', function() {
			var buttonLabel = 'Hello',
				suggestionComponent = TestUtils.renderIntoDocument(
					<DomainSuggestion isAdded={false} buttonLabel={buttonLabel} />
				);
			chai.expect( ReactDom.findDOMNode( suggestionComponent.refs.button ).textContent ).to.equal( buttonLabel );
		} );
	} );
} );
