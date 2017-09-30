/** @jest-environment jsdom */
jest.mock( 'components/plans/premium-popover', () => require( 'components/empty-component' ) );

/**
 * External Dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { identity, noop } from 'lodash';


describe( 'Domain Suggestion', function() {
	let DomainSuggestion;

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
