/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import ReactModal from 'react-modal';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import { setStore } from 'calypso/state/redux-store';
import { receiveSite } from 'calypso/state/sites/actions';
import { receiveTheme, themeActivated } from 'calypso/state/themes/actions';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import ThanksModal from '../thanks-modal';

ReactModal.setAppElement( '*' ); // suppresses modal-related test warnings.

const TestComponent = ( { store } ) => {
	const queryClient = new QueryClient();
	return (
		<ReduxProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<ThanksModal source="details" />
			</QueryClientProvider>
		</ReduxProvider>
	);
};

const themeId = 'twentysixteen';
const themeStyleSheet = `pub/${ themeId }`;
const siteId = 123;
const userId = 456;
const source = 'unknown';
const purchased = false;

/**
 * The `is_fse_active` flag depends on the theme that just
 * got activated on the back-end, so we need to refetch
 * that flag whenever the theme changes.
 */
const setupAPIResponse = ( { is_fse_active } ) => {
	return nock( 'https://public-api.wordpress.com:443' )
		.get( `/wpcom/v2/sites/${ siteId }/block-editor` )
		.reply( 200, {
			is_fse_eligible: true,
			is_fse_active,
		} );
};

const defaultSite = { ID: siteId, name: 'Example site', URL: 'https://example.com' };
const defaultTheme = {
	id: themeId,
	name: 'Twenty Sixteen',
	author: 'the WordPress team',
	screenshot:
		'https://i0.wp.com/theme.wordpress.com/wp-content/themes/pub/twentysixteen/screenshot.png',
	description: 'Twenty Sixteen is a modernized take on an ever-popular WordPress layout — ...',
	descriptionLong: '<p>Mumble Mumble</p>',
	download: 'https://public-api.wordpress.com/rest/v1/themes/download/twentysixteen.zip',
	taxonomies: {},
	stylesheet: themeStyleSheet,
	demo_uri: 'https://twentysixteendemo.wordpress.com/',
};

const setupStore = ( { site = defaultSite, theme = defaultTheme } = {} ) => {
	const store = createReduxStore();
	setStore( store );

	store.dispatch( receiveSite( site ) );
	store.dispatch( receiveTheme( theme, 'wpcom' ) );
	store.dispatch( receiveTheme( theme, siteId ) );
	store.dispatch( setSelectedSiteId( siteId ) );
	store.dispatch( setCurrentUser( { ID: userId } ) );
	store.dispatch( themeActivated( theme.stylesheet, siteId, source, purchased ) );

	return store;
};

describe( 'thanks-modal', () => {
	describe( 'when activating an FSE theme', () => {
		beforeEach( () => {
			setupAPIResponse( { is_fse_active: true } );
		} );

		test( 'displays the "Edit site" call to action and links it to the site editor', async () => {
			const store = setupStore();

			render( <TestComponent store={ store } /> );

			await waitFor( () => {
				const editSiteCallToAction = screen.getByText( 'Edit site' );

				expect( editSiteCallToAction ).toBeInTheDocument();
				expect( editSiteCallToAction.closest( 'a' ) ).toHaveAttribute(
					'href',
					'/site-editor/example.com'
				);
			} );
		} );
	} );

	describe( 'when activating a non-FSE theme that has a front page', () => {
		beforeEach( () => {
			setupAPIResponse( { is_fse_active: false } );
		} );

		test( 'displays the "Edit homepage" call to action and links it to the page editor', async () => {
			const store = setupStore( {
				site: {
					...defaultSite,
					options: { show_on_front: 'page' },
				},
				theme: {
					...defaultTheme,
					taxonomies: {
						theme_feature: [
							{
								slug: 'auto-loading-homepage',
							},
							{
								slug: 'global-styles',
							},
						],
					},
				},
			} );

			render( <TestComponent store={ store } /> );

			await waitFor( () => {
				const editHomepage = screen.getByText( 'Edit homepage' );

				expect( editHomepage ).toBeInTheDocument();
				expect( editHomepage.closest( 'a' ) ).toHaveAttribute( 'href', '/page/example.com' );
			} );
		} );
	} );

	describe( 'when activating a non-FSE theme that does not have a front page', () => {
		beforeEach( () => {
			setupAPIResponse( { is_fse_active: false } );
		} );

		test( 'displays the "Customize site" call to action and links it to the customizer', async () => {
			const store = setupStore();

			render( <TestComponent store={ store } /> );

			await waitFor( () => {
				const customizeSiteCallToAction = screen.getByText( 'Customize site' );

				expect( customizeSiteCallToAction ).toBeInTheDocument();
				expect( customizeSiteCallToAction.closest( 'a' ) ).toHaveAttribute(
					'href',
					'/customize/example.com'
				);
			} );
		} );
	} );

	describe( 'when activating a theme', () => {
		beforeEach( () => {
			setupAPIResponse( { is_fse_active: false } );
		} );

		test( 'waits for isFSEActive response before displaying content', async () => {
			const store = setupStore();

			render( <TestComponent store={ store } /> );

			expect( screen.getByTestId( 'loadingThanksModalContent' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Customize site' ) ).not.toBeInTheDocument();

			await waitFor( () => {
				expect( screen.getByText( 'Customize site' ) ).toBeInTheDocument();
			} );
		} );
	} );
} );
