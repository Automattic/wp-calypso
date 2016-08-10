/**
 * External Dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import identity from 'lodash/identity';

/**
 * Internal Dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';
import EmptyComponent from 'test/helpers/react/empty-component';

describe( 'Domain Suggestion', function() {
	let DomainSuggestion;

	useFakeDom();
	useMockery( ( mockery ) => {
		mockery.registerMock( 'components/plans/premium-popover', EmptyComponent );
	} );

	before( () => {
		DomainSuggestion = require( 'components/domains/domain-suggestion' );
		DomainSuggestion.prototype.translate = identity;
	} );

	describe( 'has attributes', () => {
		it( 'should have data-e2e-domain attribute for e2e testing', () => {
			const domainSuggestion = shallow( <DomainSuggestion
				domain="example.com" isAdded={ false }/> );
			if ( domainSuggestion.props()[ 'data-e2e-domain' ] ) {
				expect( domainSuggestion.props()[ 'data-e2e-domain' ] ).to.equal( 'example.com' )
			} else {
				const domainSuggestionButton = domainSuggestion.find( `.domain-suggestion__select-button` );
				expect( domainSuggestionButton.length ).to.equal( 1 );
				expect( domainSuggestionButton.props()[ 'data-e2e-domain' ] ).to.equal( 'example.com' );
			}
		} );
	} );
} );
