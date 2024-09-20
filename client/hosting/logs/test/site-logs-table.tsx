/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import siteSettings from 'calypso/state/site-settings/reducer';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SiteLogsTable } from '../components/site-logs-table';

const render = ( el, options = {} ) =>
	renderWithProvider( el, { ...options, reducers: { ui, siteSettings } } );

test( `each row is expandable independently`, async () => {
	const logs = [
		{ message: 'one', date: '2023-03-24T04:36:04.238Z' },
		{ message: 'two', date: '2023-03-24T04:36:04.123Z' },
	];

	const { container } = render(
		<SiteLogsTable logs={ logs } isLoading={ false } headerTitles={ [] } />
	);

	const expandButtons = await waitFor( () =>
		screen.getAllByRole( 'button', { expanded: false, name: 'Expand row' } )
	);

	expect( container.querySelector( '.site-logs-table__expanded-content' ) ).not.toBeInTheDocument();

	await userEvent.click( expandButtons[ 0 ] );

	await ( () => {
		expect( expandButtons[ 0 ] ).toHaveAttribute( 'aria-expanded', 'true' );
		expect( expandButtons[ 1 ] ).toHaveAttribute( 'aria-expanded', 'false' );
		expect(
			container.querySelector( 'tr:first-child .site-logs-table__expanded-content' )
		).toBeInTheDocument();
		expect(
			container.querySelector( 'tr:last-child .site-logs-table__expanded-content' )
		).not.toBeInTheDocument();
	} );

	await userEvent.click( expandButtons[ 1 ] );

	await ( () => {
		expect( expandButtons[ 0 ] ).toHaveAttribute( 'aria-expanded', 'true' );
		expect( expandButtons[ 1 ] ).toHaveAttribute( 'aria-expanded', 'true' );
		expect(
			container.querySelector( 'tr:first-child .site-logs-table__expanded-content' )
		).toBeInTheDocument();
		expect(
			container.querySelector( 'tr:last-child .site-logs-table__expanded-content' )
		).toBeInTheDocument();
	} );

	await userEvent.click( expandButtons[ 0 ] );

	await ( () => {
		expect( expandButtons[ 0 ] ).toHaveAttribute( 'aria-expanded', 'false' );
		expect( expandButtons[ 1 ] ).toHaveAttribute( 'aria-expanded', 'true' );
		expect(
			container.querySelector( 'tr:first-child .site-logs-table__expanded-content' )
		).not.toBeInTheDocument();
		expect(
			container.querySelector( 'tr:last-child .site-logs-table__expanded-content' )
		).toBeInTheDocument();
	} );
} );

test( `rows keep their expanded state after logs are updated`, async () => {
	const logs = [
		// Note: these two entries have the same timestamp
		{ message: 'one', date: '2023-03-24T04:36:04.238Z' },
		{ message: 'two', date: '2023-03-24T04:36:04.238Z' },
	];

	const { rerender } = render(
		<SiteLogsTable logs={ logs } isLoading={ false } headerTitles={ [] } />
	);

	await userEvent.click( screen.getAllByRole( 'button', { name: 'Expand row' } )[ 0 ] );

	const updatedLogs = [ { message: 'latest', date: '2023-03-24T04:37:00.000Z' }, ...logs ];

	rerender( <SiteLogsTable logs={ updatedLogs } isLoading={ false } headerTitles={ [] } /> );

	const expandButtons = await waitFor( () =>
		screen.getAllByRole( 'button', { name: 'Expand row' } )
	);

	expect( expandButtons ).toHaveLength( 3 );
	expect( expandButtons[ 0 ] ).toHaveAttribute( 'aria-expanded', 'false' );
	expect( expandButtons[ 1 ] ).toHaveAttribute( 'aria-expanded', 'true' );
	expect( expandButtons[ 2 ] ).toHaveAttribute( 'aria-expanded', 'false' );
} );
