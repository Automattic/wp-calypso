/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import CelebrateLaunchModal from '../components/celebrate-launch-modal';

const mockStore = configureStore();

describe( 'CelebrateLaunchModal', () => {
	const mockSetModalIsOpen = jest.fn();

	const defaultProps = {
		setModalIsOpen: mockSetModalIsOpen,
		site: {
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
		const store = mockStore( {} );
		render(
			<Provider store={ store }>
				<CelebrateLaunchModal { ...defaultProps } />
			</Provider>
		);

		expect( screen.getByText( 'test-site.wordpress.com' ) ).toBeInTheDocument();
	} );

	test( 'renders custom domain when present', () => {
		const store = mockStore( {} );
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
		const store = mockStore( {} );
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
