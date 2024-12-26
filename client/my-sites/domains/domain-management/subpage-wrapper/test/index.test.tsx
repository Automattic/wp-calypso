/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import SubpageWrapper from '../index';
import {
	ADD_FORWARDING_EMAIL,
	EDIT_CONTACT_INFO,
	ADD_DNS_RECORD,
	EDIT_DNS_RECORD,
} from '../subpages';

jest.mock( 'component-file-picker', () => () => <div>File Picker</div> );

describe( 'SubpageWrapper', () => {
	it( 'should render the children', () => {
		render(
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
		render(
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
		render(
			<SubpageWrapper subpageKey="non-existent" siteName="site.com" domainName="domain.com">
				<span>Hello</span>
			</SubpageWrapper>
		);

		expect( screen.getByText( 'Hello' ) ).toBeInTheDocument();
	} );

	it( 'should render breadcrumbs', () => {
		const { container } = render(
			<SubpageWrapper subpageKey={ EDIT_CONTACT_INFO } siteName="site.com" domainName="domain.com">
				<span>Hello</span>
			</SubpageWrapper>
		);

		expect( container.querySelector( '.breadcrumbs li:first-child' )?.textContent ).toContain(
			'domain.com'
		);
		expect( container.querySelector( '.breadcrumbs li:last-child' )?.textContent ).toContain(
			'Contact information'
		);
	} );

	it( 'should render Add DNS subpage breadcrumbs', () => {
		const { container } = render(
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
		const { container } = render(
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
