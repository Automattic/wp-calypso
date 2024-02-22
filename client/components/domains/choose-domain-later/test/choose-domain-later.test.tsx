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
	test( 'Renders treatment_type when showEscapeHatchAfterSearch and hasSearchedDomains are true', () => {
		useExperimentMock.mockImplementation( () => [ false, { variationName: 'treatment_type' } ] );

		const { getByText } = render(
			<ChooseDomainLater
				flowName="onboarding"
				showEscapeHatchAfterSearch={ true }
				hasSearchedDomains={ true }
				handleDomainExplainerClick={ () => {} }
			/>
		);

		expect( getByText( 'Not ready to choose a domain just yet?' ) ).toBeTruthy();
	} );

	test( 'Renders the standard domain explainer control', () => {
		useExperimentMock.mockImplementation( () => [ false, { variationName: 'control' } ] );

		const { container } = render(
			<ChooseDomainLater
				flowName="onboarding"
				showEscapeHatchAfterSearch={ false }
				hasSearchedDomains={ false }
				handleDomainExplainerClick={ () => {} }
			/>
		);

		expect( container.innerHTML ).toContain(
			'Get a <strong>free</strong> one-year domain registration with any paid annual plan.'
		);
	} );

	test( 'Does not render anything if domains have not been searched while the escape hatch should be rendered after', () => {
		useExperimentMock.mockImplementation( () => [ true, null ] );
		const { container } = render(
			<ChooseDomainLater
				flowName="onboarding"
				hasSearchedDomains={ false }
				showEscapeHatchAfterSearch={ true }
				handleDomainExplainerClick={ () => {} }
			/>
		);
		expect( container.innerHTML ).toBeFalsy();
	} );
} );
