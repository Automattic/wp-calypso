/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import CelebrateLaunchModal from '../components/celebrate-launch-modal';

const mockStore = configureStore();

jest.mock( '@automattic/data-stores', () => ( {
	...jest.requireActual( '@automattic/data-stores' ),
	updateLaunchpadSettings: jest.fn().mockResolvedValue( {} ),
} ) );

const testSite = {
	ID: 1,
	slug: 'test-site.wordpress.com',
	options: {
		site_creation_flow: 'onboarding',
	},
};

describe( 'CelebrateLaunchModal', () => {
	const mockSetModalIsOpen = jest.fn();

	const store = mockStore( {
		sites: {
			items: {
				[ testSite.ID ]: testSite,
			},
			plans: {
				items: [],
			},
			domains: {
				items: [],
			},
			launch: {
				celebration: [ testSite.ID ],
			},
		},
		currentUser: {
			id: 1,
			user: {
				had_hosting_trial: false,
			},
			capabilities: {
				[ testSite.ID ]: {
					edit_posts: true,
				},
			},
		},
		plugins: {
			installed: {
				items: [],
				isRequesting: false,
				plugins: [],
			},
		},
		jetpack: {
			modules: {
				fetching: false,
			},
			items: [],
		},
		ui: {
			selectedSiteId: testSite.ID,
		},
		userSettings: {},
	} );

	const defaultProps = {
		setModalIsOpen: mockSetModalIsOpen,
		site: {
			ID: 1,
			slug: 'test-site.wordpress.com',
			URL: 'https://test-site.wordpress.com',
			plan: {
				is_free: true,
				product_slug: 'free_plan',
			},
		},
		allDomains: [],
	};

	test( 'renders site slug when no custom domain is present', () => {
		render(
			<Provider store={ store }>
				<CelebrateLaunchModal { ...defaultProps } />
			</Provider>
		);

		expect( screen.getByText( 'test-site.wordpress.com' ) ).toBeInTheDocument();
	} );

	test( 'renders custom domain when present', () => {
		const customDomain = 'mycustomdomain.com';
		const propsWithCustomDomain = {
			...defaultProps,
			allDomains: [
				{
					domain: customDomain,
					type: 'REGISTERED',
					wpcom_domain: false,
				},
			],
		};

		render(
			<Provider store={ store }>
				<CelebrateLaunchModal { ...propsWithCustomDomain } />
			</Provider>
		);

		expect( screen.getByText( customDomain ) ).toBeInTheDocument();
	} );

	test( 'prefers custom domain over site slug when both are present', () => {
		const customDomain = 'mycustomdomain.com';
		const propsWithBothDomains = {
			...defaultProps,
			allDomains: [
				{
					domain: customDomain,
					type: 'REGISTERED',
					wpcom_domain: false,
				},
				{
					domain: 'test-site.wordpress.com',
					type: 'WPCOM',
					wpcom_domain: true,
				},
			],
		};

		render(
			<Provider store={ store }>
				<CelebrateLaunchModal { ...propsWithBothDomains } />
			</Provider>
		);

		expect( screen.getByText( customDomain ) ).toBeInTheDocument();
		expect( screen.queryByText( 'test-site.wordpress.com' ) ).not.toBeInTheDocument();
	} );
} );
