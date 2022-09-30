/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../sidebar';

jest.mock( '../../../../../hooks/use-site.ts', () => ( {
	useSite: () => {
		const site = {
			ID: 210745841,
			name: 'testlib12403',
			URL: 'https://testlib12403.wordpress.com',
			options: {
				site_intent: 'link-in-bio',
				site_vertical_id: null,
				launchpad_screen: 'full',
				launchpad_checklist_tasks_statuses: {
					links_edited: true,
				},
			},
			plan: {
				product_id: 1,
				product_slug: 'free_plan',
				product_name: 'WordPress.com Free',
			},
		};

		return site;
	},
} ) );

const siteName = 'mySite';
const secondAndTopLevelDomain = 'wordpress.com';
const siteSlug = `${ siteName }.${ secondAndTopLevelDomain }`;

function renderTestSidebar( props ) {
	render(
		<MemoryRouter initialEntries={ [ `/setup/launchpad?flow=link-in-bio&siteSlug=${ siteSlug }` ] }>
			<Sidebar { ...props } />
		</MemoryRouter>
	);
}

describe( 'Sidebar', () => {
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

	it( 'displays a progress bar based off of task completion', () => {
		renderTestSidebar( props );

		const progressBar = screen.getByRole( 'progressbar' );
		expect( progressBar ).toBeVisible();
	} );

	describe( 'when the tailored flow includes a task to launch the site', () => {
		describe( 'and all tasks except the launch site task are complete', () => {
			it( 'shows a launch title', () => {
				renderTestSidebar( props );

				const title = screen.getByRole( 'heading', { name: /ready to launch/i } );
				expect( title ).toBeVisible();
			} );
		} );
	} );
} );
