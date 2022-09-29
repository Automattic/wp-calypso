/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../sidebar';

function renderTestSidebar( props ) {
	render(
		<MemoryRouter>
			<Sidebar { ...props } />
		</MemoryRouter>
	);
}

describe( 'Sidebar', () => {
	const siteName = 'mySite';
	const secondAndTopLevelDomain = 'wordpress.com';
	const siteSlug = `${ siteName }.${ secondAndTopLevelDomain }`;

	const props = {
		siteSlug,
		/* eslint-disable @typescript-eslint/no-empty-function */
		submit: () => {},
		goNext: () => {},
		goToStep: () => {},
		/* eslint-enable @typescript-eslint/no-empty-function */
	};

	it( 'displays an escape hatch from Launchpad that will take the user to Calypso my Home', () => {
		renderTestSidebar( props );

		const escapeHatchButton = screen.getByRole( 'button', { name: /go to admin/i } );
		expect( escapeHatchButton ).toBeVisible();
	} );

	it( 'displays the current site url', () => {
		renderTestSidebar( props );

		const renderedSiteName = screen.getByText( ( content ) => content.includes( siteName ) );
		expect( renderedSiteName ).toBeVisible();

		const renderedDomain = screen.getByText( ( content ) =>
			content.includes( secondAndTopLevelDomain )
		);
		expect( renderedDomain ).toBeVisible();
	} );
} );
