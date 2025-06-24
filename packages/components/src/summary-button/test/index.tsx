/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@testing-library/user-event';
import * as React from 'react';
import SummaryButton from '../index';

describe( 'SummaryButton', () => {
	test( 'should render a button element by default', () => {
		render( <SummaryButton title="Test Title" /> );
		expect(
			screen.getByRole( 'button', {
				name: 'Test Title',
			} )
		).toBeVisible();
	} );
	test( 'should render an anchor element when href is provided', () => {
		render( <SummaryButton title="Test Title" href="/test-link" /> );
		const anchors = screen.getAllByRole( 'link' );
		expect( anchors.length ).toBe( 1 );
		expect( anchors[ 0 ] ).toHaveAttribute( 'href', '/test-link' );
	} );
	test( 'should render a button element when disabled and href is provided', () => {
		render( <SummaryButton title="Test Title" href="/test-link" disabled /> );
		expect( screen.getByRole( 'button' ) ).toBeVisible();
		expect( screen.queryByRole( 'link' ) ).toBeNull();
	} );
	test( 'should render description and strapline when provided in low density mode', () => {
		render(
			<SummaryButton
				title="Test Title"
				description="Test Description"
				strapline="Test Strapline"
				density="low"
			/>
		);
		expect( screen.getByText( 'Test Description' ) ).toBeVisible();
		expect( screen.getByText( 'Test Strapline' ) ).toBeVisible();
	} );
	test( 'should not render description and strapline in medium density mode', () => {
		render(
			<SummaryButton
				title="Test Title"
				description="Test Description"
				strapline="Test Strapline"
				density="medium"
			/>
		);
		expect( screen.queryByText( 'Test Description' ) ).toBeNull();
		expect( screen.queryByText( 'Test Strapline' ) ).toBeNull();
	} );
} );
