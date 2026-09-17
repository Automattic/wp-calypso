/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { TestDomainSearch } from '../../../test-helpers/renderer';
import { NamePulseDomainStatus, type NamePulseDomainResult } from '../../helpers';
import { NamePulseResultRow } from '../result-row';

const buildResult = ( overrides: Partial< NamePulseDomainResult > ): NamePulseDomainResult => ( {
	domain_name: 'icecream.net',
	suffix: 'net',
	status: NamePulseDomainStatus.AVAILABLE,
	source: 'exact',
	...overrides,
} );

const renderRow = ( result: NamePulseDomainResult ) =>
	render(
		<TestDomainSearch>
			<NamePulseResultRow result={ result } position={ 0 } />
		</TestDomainSearch>
	);

describe( 'NamePulseResultRow', () => {
	it( 'falls back to the server-formatted cost, without a sale, when currency_code is missing', () => {
		renderRow( buildResult( { cost: '€22.00', raw_price: 22, sale_cost: 6 } ) );

		expect( screen.getByText( '€22.00' ) ).toBeInTheDocument();
		expect( screen.getByText( '/year' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Sale' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( '/first year' ) ).not.toBeInTheDocument();
	} );

	it( 'announces the waiting skeleton', () => {
		renderRow( buildResult( { status: NamePulseDomainStatus.WAITING } ) );

		expect( screen.getByRole( 'img', { name: 'Checking…' } ) ).toBeInTheDocument();
	} );
} );
