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
