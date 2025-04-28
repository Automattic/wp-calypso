/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as React from 'react';
import SummaryButton from '../index';
import { SummaryButtonBadgeProps } from '../types';

describe( 'SummaryButton', () => {
	test( 'should render the title', () => {
		render( <SummaryButton title="Test Title" /> );
		expect( screen.getByText( 'Test Title' ) ).toBeInTheDocument();
	} );
	test( 'should render a button element by default', () => {
		const { container } = render( <SummaryButton title="Test Title" /> );
		expect( container.getElementsByTagName( 'button' ).length ).toBe( 1 );
	} );
	test( 'should render an anchor element when href is provided', () => {
		const { container } = render( <SummaryButton title="Test Title" href="/test-link" /> );
		const anchor = container.getElementsByTagName( 'a' );
		expect( anchor.length ).toBe( 1 );
		expect( anchor[ 0 ] ).toHaveAttribute( 'href', '/test-link' );
	} );
	test( 'should render a button element when disabled and href is provided', () => {
		const { container } = render( <SummaryButton title="Test Title" href="/test-link" disabled /> );
		expect( container.getElementsByTagName( 'button' ).length ).toBe( 1 );
		expect( container.getElementsByTagName( 'a' ).length ).toBe( 0 );
	} );
	test( 'should call onClick when clicked', () => {
		const onClick = jest.fn();
		const { container } = render( <SummaryButton title="Test Title" onClick={ onClick } /> );
		fireEvent.click( container.getElementsByTagName( 'button' )[ 0 ] );
		expect( onClick ).toHaveBeenCalledTimes( 1 );
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
		expect( screen.getByText( 'Test Description' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Test Strapline' ) ).toBeInTheDocument();
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
		expect( screen.queryByText( 'Test Description' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Test Strapline' ) ).not.toBeInTheDocument();
	} );
	test( 'should render badges when provided', () => {
		const badges: SummaryButtonBadgeProps[] = [
			{ text: 'Badge 1', intent: 'info' },
			{ text: 'Badge 2', intent: 'success' },
		];
		render( <SummaryButton title="Test Title" badges={ badges } /> );
		expect( screen.getByText( 'Badge 1' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Badge 2' ) ).toBeInTheDocument();
	} );
	test( 'should render chevron icon by default', () => {
		const { container } = render( <SummaryButton title="Test Title" /> );
		expect( container.getElementsByClassName( 'summary-button-navigation-icon' ).length ).toBe( 1 );
	} );
	test( 'should not render chevron icon when showArrow is false', () => {
		const { container } = render( <SummaryButton title="Test Title" showArrow={ false } /> );
		expect( container.getElementsByClassName( 'summary-button-navigation-icon' ).length ).toBe( 0 );
	} );
} );
