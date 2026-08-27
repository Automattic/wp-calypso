/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderFollowSitesPage from '../index';

jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock(
	'calypso/components/navigation-header',
	() =>
		function NavigationHeader( { title, subtitle }: { title: string; subtitle: string } ) {
			return (
				<div>
					<h1>{ title }</h1>
					<p>{ subtitle }</p>
				</div>
			);
		}
);

describe( 'ReaderFollowSitesPage', () => {
	it( 'renders the page header', () => {
		renderWithProvider( <ReaderFollowSitesPage /> );

		expect(
			screen.getByRole( 'heading', { name: 'Follow your favorite websites' } )
		).toBeVisible();
		expect( screen.getByText( 'Search by name, paste a link, or add an RSS feed.' ) ).toBeVisible();
	} );
} );
