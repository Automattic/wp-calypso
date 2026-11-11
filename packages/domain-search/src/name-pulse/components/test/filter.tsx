import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DomainSearchContext, useDomainSearchContextValue } from '../../../page/context';
import { InitialState } from '../../../page/initial-state';
import { buildCart } from '../../../test-helpers/factories/cart';
import {
	NAME_PULSE_TLDS_FIXTURE,
	withNamePulseQueries,
} from '../../../test-helpers/factories/name-pulse';
import { queryClient, TestDomainSearch } from '../../../test-helpers/renderer';
import { NamePulseFilter } from '../filter';
import type { DomainSearchProps } from '../../../page/types';

const notUsed = () => Promise.reject( new Error( 'not used' ) );

const FilterTestSearch = ( {
	tlds = async () => NAME_PULSE_TLDS_FIXTURE,
	...props
}: Partial< DomainSearchProps > & { tlds?: () => Promise< string[] > } ) => {
	const contextValue = useDomainSearchContextValue( {
		cart: buildCart(),
		config: { showNamePulseSearch: true },
		...props,
	} );

	return (
		<QueryClientProvider client={ queryClient }>
			<DomainSearchContext.Provider
				value={ withNamePulseQueries( contextValue, {
					tlds,
					availability: notUsed,
					suggestions: notUsed,
					domainAvailability: notUsed,
				} ) }
			>
				<NamePulseFilter />
			</DomainSearchContext.Provider>
		</QueryClientProvider>
	);
};

const findFilterButton = ( name = 'Filter, no filters applied' ) =>
	screen.findByRole( 'button', { name } );

describe( 'NamePulseFilter', () => {
	beforeEach( () => {
		queryClient.clear();
	} );

	it( 'is disabled until the TLD list arrives, then offers the Name Pulse endings', async () => {
		const user = userEvent.setup();
		let resolveTlds: ( tlds: string[] ) => void = () => {};

		render(
			<FilterTestSearch
				tlds={ () =>
					new Promise< string[] >( ( resolve ) => {
						resolveTlds = resolve;
					} )
				}
			/>
		);

		expect( await findFilterButton() ).toBeDisabled();

		resolveTlds( NAME_PULSE_TLDS_FIXTURE );

		await waitFor( () => expect( screen.getByRole( 'button' ) ).toBeEnabled() );

		await user.click( screen.getByRole( 'button' ) );

		expect( screen.getByText( 'Recommended endings' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'option', { name: '.blog' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'option', { name: '.com' } ) ).toBeInTheDocument();
		expect(
			screen.queryByRole( 'checkbox', { name: 'Show exact matches only' } )
		).not.toBeInTheDocument();
	} );

	it( 'renders nothing when there are no endings to choose from', async () => {
		const tlds = jest.fn( async () => [] );

		const { container } = render( <FilterTestSearch tlds={ tlds } /> );

		await waitFor( () => expect( tlds ).toHaveBeenCalled() );
		await waitFor( () => expect( container ).toBeEmptyDOMElement() );
	} );

	it( 'applies the chosen endings and clears them again', async () => {
		const user = userEvent.setup();
		const onFilterApplied = jest.fn();
		const onFilterReset = jest.fn();

		render( <FilterTestSearch events={ { onFilterApplied, onFilterReset } } /> );

		await user.click( await findFilterButton() );
		await user.click( await screen.findByRole( 'option', { name: '.com' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Apply' } ) );

		expect( await findFilterButton( 'Filter, 1 filter applied' ) ).toBeInTheDocument();
		expect( onFilterApplied ).toHaveBeenCalledWith( {
			tlds: [ 'com' ],
			exactSldMatchesOnly: false,
		} );

		await user.click( screen.getByRole( 'button', { name: 'Filter, 1 filter applied' } ) );
		await user.click( await screen.findByRole( 'button', { name: 'Clear' } ) );

		expect( await findFilterButton() ).toBeInTheDocument();
		expect( onFilterReset ).toHaveBeenCalledWith( { tlds: [], exactSldMatchesOnly: false }, [
			'tlds',
			'exactSldMatchesOnly',
		] );
	} );

	it( 'is not shown on the empty initial state', () => {
		render(
			<TestDomainSearch config={ { showNamePulseSearch: true } }>
				<InitialState />
			</TestDomainSearch>
		);

		expect( screen.getByRole( 'searchbox' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /^Filter/ } ) ).not.toBeInTheDocument();
	} );
} );
