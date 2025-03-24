/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_configureStore as configureStore } from 'redux-mock-store';
import Site from '../index';

const mockStore = configureStore();

describe( 'Site', () => {
	const defaultSite = {
		ID: 1,
		URL: 'https://example.wordpress.com',
		title: 'Test Site',
		domain: 'example.wordpress.com',
		is_private: false,
		options: {},
	};

	const createStore = ( customState = {} ) => {
		const defaultState = {
			sites: {
				items: {
					[ defaultSite.ID ]: defaultSite,
				},
				domains: {
					items: {},
					requesting: {},
					loaded: {},
				},
				plans: {
					[ defaultSite.ID ]: {},
				},
			},
			ui: {
				selectedSiteId: defaultSite.ID,
			},
			currentUser: {
				capabilities: {},
			},
		};

		return mockStore( {
			...defaultState,
			sites: {
				...defaultState.sites,
				...customState.sites,
				domains: {
					...defaultState.sites.domains,
					...customState.sites?.domains,
				},
			},
		} );
	};

	const renderComponent = ( props = {}, store = createStore() ) => {
		return render(
			<Provider store={ store }>
				<Site site={ defaultSite } { ...props } />
			</Provider>
		);
	};

	describe( 'Domain rendering', () => {
		it( 'renders site domain when no custom domains are present', () => {
			renderComponent();
			expect(
				screen.getByText( defaultSite.domain, { selector: 'div.site__domain' } )
			).toBeInTheDocument();
		} );

		it( 'renders custom domain when present', () => {
			const customDomain = 'example.com';
			const store = createStore( {
				sites: {
					domains: {
						items: {
							[ defaultSite.ID ]: [
								{
									domain: customDomain,
									isWPCOMDomain: false,
								},
								{
									domain: defaultSite.domain,
									isWPCOMDomain: true,
								},
							],
						},
						requesting: {
							[ defaultSite.ID ]: false,
						},
						loaded: {
							[ defaultSite.ID ]: true,
						},
					},
					plans: {
						[ defaultSite.ID ]: {},
					},
				},
			} );

			renderComponent( {}, store );
			expect(
				screen.getByText( customDomain, { selector: 'div.site__domain' } )
			).toBeInTheDocument();
		} );
	} );
} );
