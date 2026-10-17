/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { getFields } from '../fields';
import type { ActivityLogEntry, BackupsKnownThreatsPage } from '@automattic/api-core';
import type { ReactNode } from 'react';

const item = {
	activity_id: 'a1',
	rewind_id: '1792244294.123',
	summary: 'Flagged backup',
	content: { text: '' },
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

const renderTitle = ( knownThreatsPage?: BackupsKnownThreatsPage ) => {
	const field = getFields( undefined, undefined, undefined, knownThreatsPage ).find(
		( { id } ) => id === 'title'
	);
	const renderTitleCell = field!.render as unknown as ( props: {
		item: ActivityLogEntry;
	} ) => ReactNode;
	return <div>{ renderTitleCell( { item } ) }</div>;
};

test( 'keeps the title node mounted when the badge appears', () => {
	const { rerender } = render( renderTitle() );
	const title = screen.getByText( 'Flagged backup' );
	const titleText = title.firstChild;

	rerender( renderTitle( page ) );

	expect( screen.getByText( 'Known threats (3)' ) ).toBeVisible();
	expect( title ).toBeInTheDocument();
	expect( title.textContent ).toBe( 'Flagged backup' );
	expect( title.firstChild ).toBe( titleText );

	rerender( renderTitle() );

	expect( screen.queryByText( 'Known threats (3)' ) ).not.toBeInTheDocument();
	expect( title ).toBeInTheDocument();
	expect( title.firstChild ).toBe( titleText );
} );
