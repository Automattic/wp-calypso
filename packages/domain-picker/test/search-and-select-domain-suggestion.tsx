/**
 * External dependencies
 */
import * as React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import { DataStatus, DomainSuggestion } from '@automattic/data-stores/src/domain-suggestions';

/**
 * Internal dependencies
 */
import '../matchMedia.mock';
import DomainPicker from '../src/domain-picker';
import { useDomainSuggestions } from '../src/hooks/use-domain-suggestions';

// TODO: should we extract to separate mock data file/folder?
const MOCK_SUGGESTION: DomainSuggestion = {
	domain_name: 'example.com',
	cost: '€15.00',
	raw_price: 15,
	currency_code: 'EUR',
	relevance: 0.5,
};

const mockUseDomainSuggestionsResult: ReturnType< typeof useDomainSuggestions > = {
	allDomainSuggestions: [ MOCK_SUGGESTION ],
	errorMessage: null,
	state: DataStatus.Success,
	retryRequest: jest.fn(),
};

jest.mock( '../src/hooks/use-domain-suggestions', () => ( {
	useDomainSuggestions: () => mockUseDomainSuggestionsResult,
} ) );

describe( 'Search for a domain and select a suggestion', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should search for a domain', () => {
		render(
			<DomainPicker
				onDomainSelect={ jest.fn() }
				analyticsUiAlgo="testalgo"
				analyticsFlowId="12345"
				initialDomainSearch="water"
			/>
		);

		expect( screen.getByText( '€15.00/year' ) ).toBeInTheDocument();
	} );

	it( 'should call the onDomainSelect callback when a button is clicked ', () => {
		const onDomainSelectCallback = jest.fn();
		render(
			<DomainPicker
				onDomainSelect={ onDomainSelectCallback }
				analyticsUiAlgo="testalgo"
				analyticsFlowId="12345"
				initialDomainSearch="water"
				itemType="button"
			/>
		);

		const selectDomainButtons = screen.getAllByRole( 'button', { name: /select/i } );

		// @TODO: move this check to a unit test (which should also check the "see more" functionality)
		// Expect as many buttons as there are suggestion items in the data
		expect( selectDomainButtons ).toHaveLength(
			mockUseDomainSuggestionsResult.allDomainSuggestions.length
		);

		// Check if callback is called correctly
		fireEvent.click( selectDomainButtons[ 0 ] );

		expect( onDomainSelectCallback ).toHaveBeenCalledTimes( 1 );
		expect( onDomainSelectCallback ).toHaveBeenCalledWith(
			mockUseDomainSuggestionsResult.allDomainSuggestions[ 0 ]
		);
	} );
} );
