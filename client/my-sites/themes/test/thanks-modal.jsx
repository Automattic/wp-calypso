/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import ReactModal from 'react-modal';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import { setStore } from 'calypso/state/redux-store';
import { receiveSite } from 'calypso/state/sites/actions';
import { THEME_ACTIVATE } from 'calypso/state/themes/action-types';
import { receiveTheme, themeActivated } from 'calypso/state/themes/actions';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import ThanksModal from '../thanks-modal';

ReactModal.setAppElement( '*' ); // suppresses modal-related test warnings.

const TestComponent = ( { store } ) => {
	return (
		<ReduxProvider store={ store }>
			<ThanksModal source="details" />
		</ReduxProvider>
	);
};

const themeId = 'twentysixteen';
const themeStyleSheet = `pub/${ themeId }`;
const siteId = 123;
const userId = 456;
const source = 'unknown';
const purchased = false;

const fseThemeFeature = {
	slug: 'full-site-editing',
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

const setupStore = ( { site = defaultSite, theme = defaultTheme, asWpComTheme = false } = {} ) => {
	const store = createReduxStore();
	setStore( store );

	store.dispatch( receiveSite( site ) );
	if ( asWpComTheme ) {
		store.dispatch( receiveTheme( theme, 'wpcom' ) );
	}
	store.dispatch( receiveTheme( theme, siteId ) );
	store.dispatch( setSelectedSiteId( siteId ) );
	store.dispatch( setCurrentUser( { ID: userId } ) );
	store.dispatch( {
		type: THEME_ACTIVATE,
		themeId,
		siteId,
	} );
	store.dispatch( themeActivated( theme.stylesheet, siteId, source, purchased ) );

	return store;
};

describe( 'thanks-modal', () => {
	describe( 'when activating an FSE theme', () => {
		test( 'displays the "Customize site" call to action and links it to the site editor', async () => {
			const adminURL = 'https://example.wordpress.com/';
			const store = setupStore( {
				site: {
					...defaultSite,
					options: { admin_url: adminURL },
				},
				theme: {
					...defaultTheme,
					taxonomies: {
						theme_feature: [ fseThemeFeature ],
					},
				},
			} );

			const encodedURL = `${ adminURL }site-editor.php?calypso_origin=${ encodeURIComponent(
				defaultSite?.URL
			) }`;

			render( <TestComponent store={ store } /> );

			await waitFor( () => {
				const editSiteCallToAction = screen.getByText( 'Customize site' );

				expect( editSiteCallToAction ).toBeInTheDocument();
				expect( editSiteCallToAction.closest( 'a' ) ).toHaveAttribute( 'href', encodedURL );
			} );
		} );
	} );

	describe( 'when activating an FSE AND Dotcom theme', () => {
		test( 'does not display the modal since it will redirect to `/marketplace/thank-you`', async () => {
			const store = setupStore( {
				theme: {
					...defaultTheme,
					taxonomies: {
						theme_feature: [ fseThemeFeature ],
					},
				},
				asWpComTheme: true,
			} );

			render( <TestComponent store={ store } /> );

			await waitFor( () => {
				const editSiteCallToAction = screen.queryByText( 'Customize site' );
				expect( editSiteCallToAction ).not.toBeInTheDocument();
			} );
		} );
	} );

	describe( 'when activating a non-FSE theme that has a front page', () => {
		test( 'does not display the modal since it will redirect to `/marketplace/thank-you`', async () => {
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
				asWpComTheme: true,
			} );

			render( <TestComponent store={ store } /> );

			await waitFor( () => {
				const editSiteCallToAction = screen.queryByText( 'Customize site' );
				expect( editSiteCallToAction ).not.toBeInTheDocument();
			} );
		} );
	} );

	describe( 'when activating a non-FSE theme that does not have a front page', () => {
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
} );
