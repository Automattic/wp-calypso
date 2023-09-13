/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { SiteIndicator } from '..';

const INITIAL_STATE = {
	sites: {
		items: {},
	},
};
const mockStore = configureStore();
jest.mock( 'calypso/components/data/query-site-connection-status', () => () => {
	return <></>;
} );

const store = mockStore( INITIAL_STATE );

const defaultProps = {
	site: {
		ID: 123,
		canUpdateFiles: true,
		slug: 'example.com',
		options: {
			admin_url: 'https://example.com/wp-admin/',
		},
	},
	recordGoogleEvent: jest.fn(),
	recordTracksEvent: jest.fn(),
	trackSiteDisconnect: jest.fn(),
	translate: ( text ) => text,
};

describe( 'SiteIndicator component', () => {
	beforeAll( () => {
		// Mock the missing `window.matchMedia` function that's not even in JSDOM
		Object.defineProperty( window, 'matchMedia', {
			writable: true,
			value: jest.fn().mockImplementation( ( query ) => ( {
				matches: false,
				media: query,
				onchange: null,
				addListener: jest.fn(), // deprecated
				removeListener: jest.fn(), // deprecated
				addEventListener: jest.fn(),
				removeEventListener: jest.fn(),
				dispatchEvent: jest.fn(),
			} ) ),
		} );
		jest.clearAllMocks();
	} );
	it( 'should show update indicator if site is not atomic and has updates', () => {
		const { container } = render(
			<SiteIndicator
				{ ...{
					...defaultProps,
					...{
						userCanManage: true,
						siteIsJetpack: true,

						siteIsConnected: true,
						siteIsAutomatedTransfer: false,

						siteUpdates: { total: 1 },
					},
				} }
			/>
		);

		const errorIndicator = container.getElementsByClassName( 'is-error' );
		const updateIndicator = container.getElementsByClassName( 'is-update' );

		expect( errorIndicator.length ).toBe( 0 );
		expect( updateIndicator.length ).toBe( 1 );
	} );
	it( 'should not show upates for atomic sites', () => {
		const { container } = render(
			<SiteIndicator
				{ ...{
					...defaultProps,
					...{
						userCanManage: true,
						siteIsJetpack: true,

						siteIsConnected: true,
						siteIsAutomatedTransfer: true,

						siteUpdates: { total: 1 },
					},
				} }
			/>
		);

		const errorIndicator = container.getElementsByClassName( 'is-error' );
		const updateIndicator = container.getElementsByClassName( 'is-update' );

		expect( errorIndicator.length ).toBe( 0 );
		expect( updateIndicator.length ).toBe( 0 );
	} );

	it( 'should show error indicator if the Jetpack connection is malfunctioning', () => {
		const { container } = render(
			<SiteIndicator
				{ ...{
					...defaultProps,
					...{
						userCanManage: true,
						siteIsJetpack: true,

						siteIsConnected: false,
						siteIsAutomatedTransfer: false,

						siteUpdates: { total: 1 },
					},
				} }
			/>
		);

		const errorIndicator = container.getElementsByClassName( 'is-error' );
		const updateIndicator = container.getElementsByClassName( 'is-update' );

		expect( errorIndicator.length ).toBe( 1 );
		expect( updateIndicator.length ).toBe( 0 );
	} );

	it( 'should show indicator message on expand', () => {
		render(
			<Provider store={ store }>
				<SiteIndicator
					{ ...{
						...defaultProps,
						...{
							userCanManage: true,
							siteIsJetpack: true,

							siteIsConnected: false,
							siteIsAutomatedTransfer: false,

							siteUpdates: { total: 1 },
						},
					} }
				/>
			</Provider>
		);

		expect( screen.queryByTestId( 'site-indicator-message' ) ).not.toBeInTheDocument();
		const button = screen.getByTestId( 'site-indicator-button' );
		fireEvent.click( button );
		expect( screen.queryByTestId( 'site-indicator-message' ) ).toBeInTheDocument();
	} );
} );
