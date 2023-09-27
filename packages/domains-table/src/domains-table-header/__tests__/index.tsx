/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import React from 'react';
import { renderWithProvider } from '../../test-utils';
import { DomainsTableColumn, DomainsTableHeader } from '../index';

const noop = jest.fn();

const render = ( el ) =>
	renderWithProvider( el, {
		wrapper: ( { children } ) => <table>{ children }</table>,
	} );

const domainsTableColumns: DomainsTableColumn[] = [
	{
		name: 'domain',
		label: 'Domain',
		isSortable: true,
		initialSortDirection: 'asc',
		supportsOrderSwitching: true,
	},
	{
		name: 'status',
		label: 'Status',
		isSortable: false,
	},
];

test( 'domain columns are rendered in the header', () => {
	render(
		<DomainsTableHeader
			columns={ domainsTableColumns }
			activeSortKey="domain"
			activeSortDirection="asc"
			onChangeSortOrder={ jest.fn() }
			bulkSelectionStatus="no-domains"
			onBulkSelectionChange={ noop }
			canSelectAnyDomains
			domainCount={ 1 }
			selectedDomainsCount={ 0 }
		/>
	);

	expect( screen.queryByText( 'Domain' ) ).toBeInTheDocument();
	expect( screen.queryByText( 'Status' ) ).toBeInTheDocument();
	expect( screen.queryByTestId( 'domains-select-all-checkbox' ) ).toBeInTheDocument();
} );

test( 'renders custom header component', () => {
	const customHeaderComponent = <div>Custom Header</div>;
	const columns: DomainsTableColumn[] = [
		{
			name: 'custom',
			label: 'Custom',
			isSortable: false,
			headerComponent: customHeaderComponent,
		},
	];
	render(
		<DomainsTableHeader
			columns={ columns }
			activeSortKey="domain"
			activeSortDirection="asc"
			onChangeSortOrder={ jest.fn() }
			bulkSelectionStatus="no-domains"
			onBulkSelectionChange={ noop }
			domainCount={ 1 }
			selectedDomainsCount={ 0 }
		/>
	);

	expect( screen.queryByText( 'Custom Header' ) ).toBeInTheDocument();
	expect( screen.queryByText( 'Custom' ) ).not.toBeInTheDocument();
} );

test( 'renders a chevron next to sortable columns', () => {
	render(
		<DomainsTableHeader
			columns={ domainsTableColumns }
			activeSortKey="domain"
			activeSortDirection="asc"
			onChangeSortOrder={ jest.fn() }
			bulkSelectionStatus="no-domains"
			onBulkSelectionChange={ noop }
			domainCount={ 1 }
			selectedDomainsCount={ 0 }
		/>
	);

	const domainHeader = screen.getByText( 'Domain' );
	expect( domainHeader ).toBeInTheDocument();

	const chevronIcon = domainHeader.parentElement?.querySelector( 'svg' );
	expect( chevronIcon ).toBeInTheDocument();
} );

test( 'columns that are not sortable do not renders a chevron', () => {
	render(
		<DomainsTableHeader
			columns={ domainsTableColumns }
			activeSortKey="domain"
			activeSortDirection="asc"
			onChangeSortOrder={ jest.fn() }
			bulkSelectionStatus="no-domains"
			onBulkSelectionChange={ noop }
			domainCount={ 1 }
			selectedDomainsCount={ 0 }
		/>
	);

	const statusHeader = screen.getByText( 'Status' );
	expect( statusHeader ).toBeInTheDocument();

	const chevronIcon = statusHeader.parentElement?.querySelector( 'svg' );
	expect( chevronIcon ).not.toBeInTheDocument();
} );

test( 'no checkbox is rendered if no domains are selectable', () => {
	render(
		<DomainsTableHeader
			columns={ domainsTableColumns }
			activeSortKey="domain"
			activeSortDirection="asc"
			onChangeSortOrder={ jest.fn() }
			bulkSelectionStatus="no-domains"
			onBulkSelectionChange={ noop }
			canSelectAnyDomains={ false }
			domainCount={ 1 }
			selectedDomainsCount={ 0 }
		/>
	);

	expect( screen.queryByTestId( 'domain-select-all-checkbox' ) ).not.toBeInTheDocument();
} );
