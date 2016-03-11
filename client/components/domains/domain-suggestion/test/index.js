/**
 * External Dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import ReactDom from 'react-dom';
import React from 'react';
import TestUtils from 'react-addons-test-utils';

/**
 * Internal Dependencies
 */
import DomainSuggestion from 'components/domains/domain-suggestion';
import DomainProductPrice from 'components/domains/domain-product-price';
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'Domain Suggestion', function() {
	useFakeDom();

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
			var suggestionComponent = TestUtils.renderIntoDocument( <DomainSuggestion isAdded={ true } /> );

			expect( suggestionComponent.refs.checkmark ).to.exist;
		} );

		it( 'should show the button label when not in cart', function() {
			var buttonLabel = 'Hello',
				suggestionComponent = TestUtils.renderIntoDocument(
					<DomainSuggestion isAdded={ false } buttonLabel={ buttonLabel } />
				);
			expect( ReactDom.findDOMNode( suggestionComponent.refs.button ).textContent ).to.equal( buttonLabel );
		} );
	} );
} );
