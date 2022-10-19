/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { Site } from '@automattic/data-stores';
import { render, screen } from '@testing-library/react';
import { useDispatch } from '@wordpress/data';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../sidebar';
import { defaultSiteDetails, buildSiteDetails, buildDomainResponse } from './lib/fixtures';

const siteName = 'testlinkinbio';
const secondAndTopLevelDomain = 'wordpress.com';
const siteSlug = `${ siteName }.${ secondAndTopLevelDomain }`;

const sidebarDomain = buildDomainResponse( {
	domain: `${ siteName }.${ secondAndTopLevelDomain }`,
	isWPCOMDomain: true,
} );

const upgradeDomainBadgeText = 'Customize';
const upgradeDomainBadgeLink = `/domains/add/${ sidebarDomain.domain }`;

const props = {
	sidebarDomain,
	siteSlug,
	/* eslint-disable @typescript-eslint/no-empty-function */
	submit: () => {},
	goNext: () => {},
	goToStep: () => {},
	/* eslint-enable @typescript-eslint/no-empty-function */
};

function renderSidebar( props, siteDetails = defaultSiteDetails ) {
	function TestSidebar( props ) {
		const SITE_STORE = Site.register( {
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_id' ),
		} );

		const { receiveSite } = useDispatch( SITE_STORE );

		receiveSite( siteDetails.ID, siteDetails );

		return (
			<MemoryRouter
				initialEntries={ [ `/setup/launchpad?flow=link-in-bio&siteSlug=${ siteSlug }` ] }
			>
				<Sidebar { ...props } />
			</MemoryRouter>
		);
	}

	render( <TestSidebar { ...props } /> );
}

describe( 'Sidebar', () => {
	afterEach( () => {
		props.sidebarDomain = sidebarDomain;
	} );

	it( 'displays an escape hatch from Launchpad that will take the user to Calypso my Home', () => {
		renderSidebar( props );

		const escapeHatchButton = screen.getByRole( 'button', { name: /go to admin/i } );
		expect( escapeHatchButton ).toBeVisible();
	} );

	it( 'displays the current site url', () => {
		renderSidebar( props );

		const renderedSiteName = screen.getByText( ( content ) => content.includes( siteName ) );
		expect( renderedSiteName ).toBeVisible();

		const renderedDomain = screen.getByText( ( content ) =>
			content.includes( secondAndTopLevelDomain )
		);
		expect( renderedDomain ).toBeVisible();
	} );

	it( 'displays customize badge for wpcom domains (free)', () => {
		renderSidebar( props );
		expect( screen.getByRole( 'link', { name: upgradeDomainBadgeText } ) ).toHaveAttribute(
			'href',
			upgradeDomainBadgeLink
		);
	} );

	it( 'does not display customize badge for non wpcom domains (paid)', () => {
		props.sidebarDomain = buildDomainResponse( {
			domain: 'paidtestlinkinbio.blog',
			isWPCOMDomain: false,
		} );

		renderSidebar( props );

		const upgradeDomainBadgeElement = screen.queryByRole( 'link', {
			name: 'upgradeDomainBadgeText',
		} );

		expect( upgradeDomainBadgeElement ).not.toBeInTheDocument;
	} );

	it( 'displays a progress bar based off of task completion', () => {
		renderSidebar( props );

		const progressBar = screen.getByRole( 'progressbar' );
		expect( progressBar ).toBeVisible();
	} );

	describe( 'when the tailored flow includes a task to launch the site', () => {
		describe( 'and all tasks except the launch site task are complete', () => {
			it( 'shows a launch title', () => {
				const siteDetails = buildSiteDetails( {
					options: {
						...defaultSiteDetails.options,
						launchpad_checklist_tasks_statuses: {
							links_edited: true,
						},
					},
				} );
				renderSidebar( props, siteDetails );

				const title = screen.getByRole( 'heading', { name: /ready to launch/i } );
				expect( title ).toBeVisible();
			} );
		} );

		describe( 'and other tasks besides the launch site task are incomplete', () => {
			it( 'shows a normal title', () => {
				renderSidebar( props );

				const title = screen.getByRole( 'heading', { name: /almost ready/i } );
				expect( title ).toBeVisible();
			} );
		} );
	} );
} );
