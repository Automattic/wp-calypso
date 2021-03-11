/**
 * External dependencies
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { DataStatus } from '@automattic/data-stores/src/domain-suggestions/constants';

/**
 * Internal dependencies
 */
import '../matchMedia.mock';
import DomainPicker from '../src/domain-picker';


import { useDomainSuggestions } from '../src/hooks';
jest.mock( '../src/hooks/use-domain-suggestions' );

describe( 'Search for a domain and select a suggestion', () => {
	beforeAll( () => {
		useDomainSuggestions.mockReturnValue( {
			allDomainSuggestions: [
				{
					domain_name: 'example.com',
					cost: '€15.00',
					raw_price: 15,
					currency_code: 'USD',
					relevance: 0.5,
				},
			],
			errorMessage: null,
			state: DataStatus.Success,
			retryRequest: jest.fn(),
		} );
	} );

	it( 'should search for a domain', () => {
		const { debug } = render(
			<DomainPicker
				onDomainSelect={ jest.fn() }
				analyticsUiAlgo="testalgo"
				analyticsFlowId="12345"
				initialDomainSearch="water"
			/>
		);
		debug();
		expect( screen.getByText( '€15.00/year' ) ).toBeTruthy();
	} );
} );
