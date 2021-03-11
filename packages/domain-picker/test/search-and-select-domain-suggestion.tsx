/**
 * External dependencies
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { DataStatus } from '@automattic/data-stores/src/domain-suggestions/constants';
import type { DomainSuggestion } from '@automattic/data-stores/src/domain-suggestions/types';

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

beforeEach( () => {
	jest.clearAllMocks();
} );

describe( 'Search for a domain and select a suggestion', () => {
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
