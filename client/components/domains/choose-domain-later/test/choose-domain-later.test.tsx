/** @jest-environment jsdom */

import React from 'react';
import { useExperiment } from 'calypso/lib/explat';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ChooseDomainLater from '../index';

const useExperimentMock = useExperiment as jest.MockedFunction< any >;
const render = ( el, options? ) => renderWithProvider( el, { ...options, reducers: { ui } } );

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );

describe( 'ChooseDomainLater', () => {
	test( 'Renders treatment_type when that treatment is active', () => {
		useExperimentMock.mockImplementation( () => [ false, { variationName: 'treatment_type' } ] );

		const { getByText } = render(
			<ChooseDomainLater
				flowName="onboarding"
				step={ {
					domainForm: {
						loadingResults: false,
						searchResults: Array( 5 ).fill( {} ),
					},
				} }
				handleDomainExplainerClick={ () => {} }
			/>
		);

		expect( getByText( 'Not ready to choose a domain just yet?' ) ).toBeTruthy();
	} );

	test( 'Renders treatment_search when that treatment is active', () => {
		useExperimentMock.mockImplementation( () => [ false, { variationName: 'treatment_search' } ] );

		const { getByText } = render(
			<ChooseDomainLater
				flowName="onboarding"
				step={ {
					domainForm: {
						loadingResults: false,
						searchResults: Array( 5 ).fill( {} ),
					},
				} }
				handleDomainExplainerClick={ () => {} }
			/>
		);

		expect( getByText( 'Get a free domain with select paid plans' ) ).toBeTruthy();
	} );

	test( 'Renders control when that control is active', () => {
		useExperimentMock.mockImplementation( () => [ false, { variationName: 'control' } ] );

		const { container } = render(
			<ChooseDomainLater
				flowName="onboarding"
				step={ {
					domainForm: {
						loadingResults: false,
						searchResults: Array( 5 ).fill( {} ),
					},
				} }
				handleDomainExplainerClick={ () => {} }
			/>
		);

		expect( container.innerHTML ).toContain(
			'Get a <strong>free</strong> one-year domain registration with any paid annual plan.'
		);
	} );

	test( 'Does not render if treatment_search and domain results not loaded', () => {
		useExperimentMock.mockImplementation( () => [ false, { variationName: 'treatment_search' } ] );

		const { queryByText } = render(
			<ChooseDomainLater
				flowName="onboarding"
				step={ {
					domainForm: {
						loadingResults: true,
						searchResults: [],
					},
				} }
				handleDomainExplainerClick={ () => {} }
			/>
		);

		expect( queryByText( 'Get a free domain with select paid plans' ) ).toBeFalsy();
	} );

	test( 'Does not render if treatment_type and domain results not loaded', () => {
		useExperimentMock.mockImplementation( () => [ false, { variationName: 'treatment_type' } ] );

		const { queryByText } = render(
			<ChooseDomainLater
				flowName="onboarding"
				step={ {
					domainForm: {
						loadingResults: true,
						searchResults: [],
					},
				} }
				handleDomainExplainerClick={ () => {} }
			/>
		);

		expect( queryByText( 'Not ready to choose a domain just yet?' ) ).toBeFalsy();
	} );

	test( 'Does not render anything if experiment is still loading', () => {
		useExperimentMock.mockImplementation( () => [ true, null ] );
		const { container } = render(
			<ChooseDomainLater
				flowName="onboarding"
				step={ {
					domainForm: {
						loadingResults: false,
						searchResults: [],
					},
				} }
				handleDomainExplainerClick={ () => {} }
			/>
		);
		expect( container.innerHTML ).toBeFalsy();
	} );
} );
