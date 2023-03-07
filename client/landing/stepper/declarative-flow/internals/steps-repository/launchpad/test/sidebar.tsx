/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { Site } from '@automattic/data-stores';
import { render, screen } from '@testing-library/react';
import { useDispatch } from '@wordpress/data';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import * as redux from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createReduxStore } from 'calypso/state';
import { getInitialState, getStateFromCache } from 'calypso/state/initial-state';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import Sidebar from '../sidebar';
import { defaultSiteDetails, buildSiteDetails, buildDomainResponse } from './lib/fixtures';

jest.mock( 'calypso/state/sites/hooks/use-premium-global-styles', () => ( {
	usePremiumGlobalStyles: () => ( {
		shouldLimitGlobalStyles: false,
		globalStylesInUse: false,
	} ),
} ) );

const siteName = 'testlinkinbio';
const secondAndTopLevelDomain = 'wordpress.com';
const siteSlug = `${ siteName }.${ secondAndTopLevelDomain }`;

const sidebarDomain = buildDomainResponse( {
	domain: `${ siteName }.${ secondAndTopLevelDomain }`,
	isWPCOMDomain: true,
} );

const upgradeDomainBadgeText = 'Customize';
const upgradeDomainBadgeLink = `/domains/add/${ sidebarDomain.domain }?domainAndPlanPackage=true`;

const props = {
	sidebarDomain,
	siteSlug,
	/* eslint-disable @typescript-eslint/no-empty-function */
	submit: () => {},
	goNext: () => {},
	goToStep: () => {},
	flow: 'link-in-bio',
	/* eslint-enable @typescript-eslint/no-empty-function */
};

const user = {
	ID: 1234,
	username: 'testUser',
	email: 'testemail@wordpress.com',
	email_verified: false,
};

function renderSidebar( props, siteDetails = defaultSiteDetails, emailVerified = false ) {
	const initialState = getInitialState( initialReducer, user.ID );
	const reduxStore = createReduxStore(
		{
			...initialState,
			currentUser: {
				user: {
					...user,
					email_verified: emailVerified,
				},
			},
		},
		initialReducer
	);
	setStore( reduxStore, getStateFromCache( user.ID ) );
	const queryClient = new QueryClient();

	function TestSidebar( props ) {
		const SITE_STORE = Site.register( {
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_id' ),
		} );

		const { receiveSite } = useDispatch( SITE_STORE );

		receiveSite( siteDetails.ID, siteDetails );

		return (
			<redux.Provider store={ reduxStore }>
				<QueryClientProvider client={ queryClient }>
					<MemoryRouter
						initialEntries={ [ `/setup/link-in-bio/launchpad?siteSlug=${ siteSlug }` ] }
					>
						<Sidebar { ...props } />
					</MemoryRouter>
				</QueryClientProvider>
			</redux.Provider>
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

		const escapeHatchButton = screen.getByRole( 'button', { name: /Skip to dashboard/i } );
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

	it( 'does not display customize badge for a flow with a redundant domain upsell task', () => {
		props.sidebarDomain = buildDomainResponse( {
			domain: 'paidtestlinkinbio.blog',
			flow: 'free',
			isWPCOMDomain: true,
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

	describe( 'when no custom domain has been purchased', () => {
		it( 'shows a copy url to clipboard button', () => {
			renderSidebar( {
				...props,
				sidebarDomain: buildDomainResponse( {
					sslStatus: null,
					isWPCOMDomain: true,
				} ),
			} );

			const clipboardButton = screen.getByLabelText( /Copy URL/i );

			expect( clipboardButton ).toBeInTheDocument();
		} );

		it( 'does not show a custom domain setup notification for free wpcom domains', () => {
			renderSidebar( {
				...props,
				sidebarDomain: buildDomainResponse( {
					sslStatus: null,
					isWPCOMDomain: true,
				} ),
			} );

			const domainProcessingNotification = screen.queryByText(
				/We are currently setting up your new domain! It may take a few minutes before it is ready./i
			);

			expect( domainProcessingNotification ).not.toBeInTheDocument();
		} );
	} );

	describe( 'when a custom domain has been purchased', () => {
		describe( 'and the domain SSL is still being processed', () => {
			it( 'does not show a copy url to clipboard button', () => {
				renderSidebar( {
					...props,
					sidebarDomain: buildDomainResponse( {
						sslStatus: 'pending',
						isWPCOMDomain: false,
					} ),
				} );

				const clipboardButton = screen.queryByLabelText( /Copy URL/i );

				expect( clipboardButton ).not.toBeInTheDocument();
			} );

			it( 'shows a notification explaining that the domain is being set up', () => {
				renderSidebar( {
					...props,
					sidebarDomain: buildDomainResponse( {
						sslStatus: 'pending',
						isWPCOMDomain: false,
					} ),
				} );

				const domainProcessingNotification = screen.getByText(
					/We are currently setting up your new domain! It may take a few minutes before it is ready./i
				);

				expect( domainProcessingNotification ).toBeInTheDocument();
			} );
		} );

		describe( 'and the domain SSL has been activated', () => {
			it( 'shows a copy url to clipboard button', () => {
				renderSidebar( {
					...props,
					sidebarDomain: buildDomainResponse( {
						sslStatus: 'active',
						isWPCOMDomain: false,
						isPrimary: true,
					} ),
				} );

				const clipboardButton = screen.getByLabelText( /Copy URL/i );

				expect( clipboardButton ).toBeInTheDocument();
			} );

			it( 'does not show a notification', () => {
				renderSidebar( {
					...props,
					sidebarDomain: buildDomainResponse( {
						sslStatus: 'active',
						isWPCOMDomain: false,
						isPrimary: true,
					} ),
				} );

				const domainProcessingNotification = screen.queryByText(
					/We are currently setting up your new domain! It may take a few minutes before it is ready./i
				);

				expect( domainProcessingNotification ).not.toBeInTheDocument();
			} );
		} );
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

				const title = screen.getByRole( 'heading', { name: /link and launch/i } );
				expect( title ).toBeVisible();
			} );
		} );

		describe( 'and other tasks besides the launch site task are incomplete', () => {
			it( 'shows a normal title', () => {
				renderSidebar( props );

				const title = screen.getByRole( 'heading', { name: /link and launch/i } );
				expect( title ).toBeVisible();
			} );
		} );
	} );

	describe( 'when the tailored flow includes a upsell task', () => {
		describe( 'and the site is on a free plan', () => {
			it( 'displays the upgrade plan badge on the "Choose a domain" task for free flow', () => {
				const freeFlowProps = { ...props, flow: 'free' };

				const siteDetails = buildSiteDetails( {
					options: {
						...defaultSiteDetails.options,
					},
					plan: {
						is_free: true,
					},
				} );
				renderSidebar( freeFlowProps, siteDetails );

				const domainUpsellTaskFreeFlow = screen.queryByText( 'Choose a domain' );
				const domainUpsellTaskBadgeFreeFlow = screen.queryByText( 'Upgrade plan' );
				expect( domainUpsellTaskFreeFlow ).toBeVisible();
				expect( domainUpsellTaskBadgeFreeFlow ).toBeVisible();
			} );

			it( 'displays the upgrade plan badge on the "Choose a domain" task for write flow', () => {
				const writeFlowProps = { ...props, flow: 'write' };

				const siteDetails = buildSiteDetails( {
					options: {
						...defaultSiteDetails.options,
					},
					plan: {
						is_free: true,
					},
				} );
				renderSidebar( writeFlowProps, siteDetails );

				const domainUpsellTaskFreeFlow = screen.queryByText( 'Choose a domain' );
				const domainUpsellTaskBadgeFreeFlow = screen.queryByText( 'Upgrade plan' );
				expect( domainUpsellTaskFreeFlow ).toBeVisible();
				expect( domainUpsellTaskBadgeFreeFlow ).toBeVisible();
			} );

			it( 'displays the upgrade plan badge on the "Choose a domain" task for build flow', () => {
				const buildFlowProps = { ...props, flow: 'build' };

				const siteDetails = buildSiteDetails( {
					options: {
						...defaultSiteDetails.options,
					},
					plan: {
						is_free: true,
					},
				} );
				renderSidebar( buildFlowProps, siteDetails );

				const domainUpsellTaskFreeFlow = screen.queryByText( 'Choose a domain' );
				const domainUpsellTaskBadgeFreeFlow = screen.queryByText( 'Upgrade plan' );
				expect( domainUpsellTaskFreeFlow ).toBeVisible();
				expect( domainUpsellTaskBadgeFreeFlow ).toBeVisible();
			} );
		} );

		describe( 'and the site is on a paid plan', () => {
			it( 'does not display the upgrade plan badge on the "Choose a domain" task for free flow', () => {
				const freeFlowProps = { ...props, flow: 'free' };
				const siteDetails = buildSiteDetails( {
					options: {
						...defaultSiteDetails.options,
					},
					plan: {
						is_free: false,
					},
				} );
				renderSidebar( freeFlowProps, siteDetails );

				const domainUpsellTask = screen.queryByText( 'Choose a domain' );
				const domainUpsellTaskBadge = screen.queryByText( 'Upgrade plan' );
				expect( domainUpsellTask ).toBeVisible();
				expect( domainUpsellTaskBadge ).toBeNull();
			} );

			it( 'does not display the upgrade plan badge on the "Choose a domain" task for write flow', () => {
				const writeFlowProps = { ...props, flow: 'write' };
				const siteDetails = buildSiteDetails( {
					options: {
						...defaultSiteDetails.options,
					},
					plan: {
						is_free: false,
					},
				} );
				renderSidebar( writeFlowProps, siteDetails );

				const domainUpsellTask = screen.queryByText( 'Choose a domain' );
				const domainUpsellTaskBadge = screen.queryByText( 'Upgrade plan' );
				expect( domainUpsellTask ).toBeVisible();
				expect( domainUpsellTaskBadge ).toBeNull();
			} );

			it( 'does not display the upgrade plan badge on the "Choose a domain" task for build flow', () => {
				const buildFlowProps = { ...props, flow: 'build' };
				const siteDetails = buildSiteDetails( {
					options: {
						...defaultSiteDetails.options,
					},
					plan: {
						is_free: false,
					},
				} );
				renderSidebar( buildFlowProps, siteDetails );

				const domainUpsellTask = screen.queryByText( 'Choose a domain' );
				const domainUpsellTaskBadge = screen.queryByText( 'Upgrade plan' );
				expect( domainUpsellTask ).toBeVisible();
				expect( domainUpsellTaskBadge ).toBeNull();
			} );
		} );
	} );
} );
