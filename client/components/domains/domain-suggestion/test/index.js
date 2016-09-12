/**
 * External Dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { identity, noop } from 'lodash';

/**
 * Internal Dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';
import EmptyComponent from 'test/helpers/react/empty-component';

describe( 'Domain Suggestion', function() {
	let abtestResult, DomainSuggestion;

	useFakeDom();
	useMockery( ( mockery ) => {
		mockery.registerMock( 'components/plans/premium-popover', EmptyComponent );
		mockery.registerMock( 'lib/abtest', {
			abtest: () => abtestResult
		} );
	} );

	before( () => {
		DomainSuggestion = require( 'components/domains/domain-suggestion' );
		DomainSuggestion.prototype.translate = identity;
	} );

	describe( 'has attributes', () => {
		context( 'AB test clickableButton', () => {
			before( () => {
				abtestResult = 'clickableButton';
			} );

			it( 'should have data-e2e-domain attribute for e2e testing', () => {
				const domainSuggestion = shallow(
					<DomainSuggestion
						buttonContent="Click Me"
						domain="example.com"
						isAdded={ false }
						onButtonClick={ noop }
						priceRule="PRICE" />
				);

				const domainSuggestionButton = domainSuggestion.find( '.domain-suggestion__select-button' );
				expect( domainSuggestionButton.length ).to.equal( 1 );
				expect( domainSuggestionButton.props()[ 'data-e2e-domain' ] ).to.equal( 'example.com' );
			} );
		} );

		context( 'AB test clickableRow', () => {
			before( () => {
				abtestResult = 'clickableRow';
			} );

			it( 'should have data-e2e-domain attribute for e2e testing', () => {
				const domainSuggestion = shallow(
					<DomainSuggestion
						buttonContent="Click Me"
						domain="example.com"
						isAdded={ false }
						onButtonClick={ noop }
						priceRule="PRICE" />
				);

				expect( domainSuggestion.props()[ 'data-e2e-domain' ] ).to.equal( 'example.com' );
			} );
		} );
	} );
} );
