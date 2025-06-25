/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { screen } from '@testing-library/react';
import React from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import SidebarItem from '../item';

const render = ( el ) => renderWithProvider( el );

test( 'external links open in a new tab', () => {
	// Don't test external links using the traditional "example.com" domain, because that's the domain
	// Testing Library uses as the default window.location, so they don't appear to be external.
	render( <SidebarItem label="My Example" link="https://my-example.com" /> );

	expect( screen.getByRole( 'link', { name: 'My Example' } ) ).toHaveAttribute(
		'target',
		'_blank'
	);
} );

test( 'external links can be forced to open in the same tab', () => {
	render( <SidebarItem label="My Example" link="https://my-example.com" forceInternalLink /> );

	expect( screen.getByRole( 'link', { name: 'My Example' } ) ).not.toHaveAttribute(
		'target',
		'_blank'
	);
} );

test( 'internal links open in a the same tab', () => {
	render( <SidebarItem label="Home" link="/home/example.com" /> );

	expect( screen.getByRole( 'link', { name: 'Home' } ) ).not.toHaveAttribute( 'target', '_blank' );
} );

test( 'internal links can be forced to open in a new tab', () => {
	render( <SidebarItem label="Home" link="/home/example.com" forceExternalLink /> );

	expect( screen.getByRole( 'link', { name: 'Home' } ) ).toHaveAttribute( 'target', '_blank' );
} );
