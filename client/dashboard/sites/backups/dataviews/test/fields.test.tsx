/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { render } from '../../../../test-utils';
import { getFields } from '../fields';
import type { ActivityLogEntry, BackupsKnownThreatsPage } from '@automattic/api-core';
import type { ReactNode } from 'react';

const item = {
	activity_id: 'a1',
	rewind_id: '1792244294.123',
	summary: 'Flagged backup',
	content: { text: '42 plugins, 5 themes' },
	published: '2026-10-16T10:00:00Z',
	name: 'rewind__backup_complete_full',
} as unknown as ActivityLogEntry;

const page: BackupsKnownThreatsPage = {
	byPeriod: {
		1792244294: { malware: 3, database: 0, vulnerable: 0, ignored: 0, flagged: 3, fixed: 0 },
	},
	periods: [ 1792244294 ],
	latestWithoutKnownThreats: null,
	oldestPeriod: 1792244294,
	totalPages: 1,
};

const renderCell = ( id: string, knownThreatsPage?: BackupsKnownThreatsPage ) => {
	const field = getFields( undefined, undefined, 0, knownThreatsPage ).find(
		( field ) => field.id === id
	);
	const renderFieldCell = field!.render as unknown as ( props: {
		item: ActivityLogEntry;
	} ) => ReactNode;
	return <div data-testid={ id }>{ renderFieldCell( { item } ) }</div>;
};

test( 'shows the badge after the content line, not in the title', async () => {
	render(
		<>
			{ renderCell( 'title', page ) }
			{ renderCell( 'content_text', page ) }
		</>
	);

	expect( await screen.findByTestId( 'content_text' ) ).toHaveTextContent( 'Known threats (3)' );
	expect( screen.getByTestId( 'title' ) ).not.toHaveTextContent( 'Known threats' );
} );

function ContentCellWithToggle() {
	const [ knownThreatsPage, setKnownThreatsPage ] = useState< BackupsKnownThreatsPage >();
	return (
		<>
			<button onClick={ () => setKnownThreatsPage( knownThreatsPage ? undefined : page ) }>
				toggle
			</button>
			{ renderCell( 'content_text', knownThreatsPage ) }
		</>
	);
}

test( 'keeps the content node mounted when the badge appears', async () => {
	const user = userEvent.setup();
	render( <ContentCellWithToggle /> );
	const date = ( await screen.findByTestId( 'content_text' ) ).firstChild as HTMLElement;
	const dateText = date.firstChild;

	await user.click( screen.getByRole( 'button', { name: 'toggle' } ) );

	expect( screen.getByText( 'Known threats (3)' ) ).toBeVisible();
	expect( date ).toBeInTheDocument();
	expect( date.firstChild ).toBe( dateText );

	await user.click( screen.getByRole( 'button', { name: 'toggle' } ) );

	expect( screen.queryByText( 'Known threats (3)' ) ).not.toBeInTheDocument();
	expect( date.firstChild ).toBe( dateText );
} );

test( 'explains the badge to screen readers without an unreachable tooltip', async () => {
	const user = userEvent.setup();
	render( renderCell( 'content_text', page ) );

	const badge = await screen.findByText( 'Known threats (3)' );
	expect( screen.getByTestId( 'content_text' ) ).toHaveTextContent(
		'This backup is known to contain 3 security threats. Restoring it may bring malware back to your site.'
	);
	await user.hover( badge );
	expect( screen.queryByRole( 'tooltip' ) ).not.toBeInTheDocument();
} );
