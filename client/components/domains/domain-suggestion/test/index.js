/**
 * External Dependencies
 */
import { expect } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';
import noop from 'lodash/noop';

/**
 * Internal Dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'Domain Suggestion', function() {
	let DomainSuggestion;

	useFakeDom();
	useMockery( ( mockery ) => {
		mockery.registerMock( 'components/plans/premium-popover', noop );
	} );

	before( () => {
		DomainSuggestion = require( 'components/domains/domain-suggestion' );
		DomainSuggestion.prototype.translate = ( x ) => x;
	} );

	describe( 'has attributes', () => {
		it( 'should have data-e2e-domain attribute for e2e testing', () => {
			const domainSuggestion = shallow( <DomainSuggestion
				domain="example.com" isAdded={ false }/> );
			const domainSuggestionButton = domainSuggestion.find( `.domain-suggestion__select-button` );
			expect( domainSuggestionButton.length ).to.equal( 1 );
			expect( domainSuggestionButton.props()[ 'data-e2e-domain' ] ).to.equal( 'example.com' );
		} );
	} );

	describe( 'added domain', function() {
		it( 'should show a checkbox when in cart', function() {
			const domainSuggestion = shallow( <DomainSuggestion isAdded={ true } /> );
			const domainSuggestionButton = domainSuggestion.find( '.domain-suggestion__select-button' );
			expect( domainSuggestionButton.children().props().icon ).to.equal( 'checkmark' );
		} );

		it( 'should show the button label when not in cart', function() {
			const buttonLabel = 'Select';
			const domainSuggestion = shallow(
					<DomainSuggestion isAdded={ false } buttonLabel={ buttonLabel } />
				);
			const domainSuggestionButton = domainSuggestion.find( '.domain-suggestion__select-button' );
			expect( domainSuggestionButton.text() ).to.equal( buttonLabel );
		} );
	} );
} );
