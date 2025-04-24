/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SubpageWrapper from '../index';
import { ADD_FORWARDING_EMAIL, ADD_DNS_RECORD, EDIT_DNS_RECORD } from '../subpages';

jest.mock( 'component-file-picker', () => () => <div>File Picker</div> );

const initialState = {
	sites: {
		items: {
			1: {
				ID: 1,
				URL: 'example.wordpress.com',
				plan: {
					product_slug: 'free_plan',
				},
				options: {
					is_wpforteams_site: false,
				},
			},
		},
	},
	ui: {
		selectedSiteId: 1,
	},
};

const mockStore = configureStore();
const store = mockStore( initialState );

const wrapper = ( { children } ) => <Provider store={ store }>{ children }</Provider>;
const renderWithWrapper = ( component ) => render( component, { wrapper } );

describe( 'SubpageWrapper', () => {
	it( 'should render the children', () => {
		renderWithWrapper(
			<SubpageWrapper
				subpageKey={ ADD_FORWARDING_EMAIL }
				siteName="site.com"
				domainName="domain.com"
			>
				<span>Hello</span>
			</SubpageWrapper>
		);

		expect( screen.getByText( 'Hello' ) ).toBeInTheDocument();
	} );

	it( 'should render the children with the subpage header', () => {
		renderWithWrapper(
			<SubpageWrapper
				subpageKey={ ADD_FORWARDING_EMAIL }
				siteName="site.com"
				domainName="domain.com"
			>
				<span>Hello</span>
			</SubpageWrapper>
		);

		expect(
			screen.getByRole( 'heading', { name: 'Add new email forwarding' } )
		).toBeInTheDocument();
		expect(
			screen.getByText( 'Seamlessly redirect your messages to where you need them.' )
		).toBeInTheDocument();
	} );

	it( 'should render the children without the subpage header', () => {
		renderWithWrapper(
			<SubpageWrapper subpageKey="non-existent" siteName="site.com" domainName="domain.com">
				<span>Hello</span>
			</SubpageWrapper>
		);

		expect( screen.getByText( 'Hello' ) ).toBeInTheDocument();
	} );

	it( 'should render Add DNS subpage breadcrumbs', () => {
		const { container } = renderWithWrapper(
			<SubpageWrapper subpageKey={ ADD_DNS_RECORD } siteName="site.com" domainName="domain.com">
				<span>Hello</span>
			</SubpageWrapper>
		);

		expect( container.querySelector( '.breadcrumbs li:nth-child(2)' )?.textContent ).toContain(
			'DNS records'
		);
		expect( container.querySelector( '.breadcrumbs li:last-child' )?.textContent ).toContain(
			'Add a new DNS record'
		);
	} );

	it( 'should render Edit DNS subpage breadcrumbs', () => {
		const { container } = renderWithWrapper(
			<SubpageWrapper subpageKey={ EDIT_DNS_RECORD } siteName="site.com" domainName="domain.com">
				<span>Hello</span>
			</SubpageWrapper>
		);

		expect( container.querySelector( '.breadcrumbs li:nth-child(2)' )?.textContent ).toContain(
			'DNS records'
		);
		expect( container.querySelector( '.breadcrumbs li:last-child' )?.textContent ).toContain(
			'Edit DNS record'
		);
	} );
} );
