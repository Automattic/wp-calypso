/**
 * @jest-environment jsdom
 *
 * Component tests for `<SignalBadge>`. Each test maps the public plugin's
 * v0.1.4 signal-rendering behaviour (signal.js + styles.css) to the React
 * component's rendered DOM.
 */

import { render, screen } from '@testing-library/react';
import SignalBadge from '../signal-badge';
import type { AdminMenuSignal } from 'calypso/state/admin-menu/types';

const baseSignal: AdminMenuSignal = {
	count: null,
	numeric_badge: null,
	badge: null,
	inline_text: null,
	inline_icon: null,
	attention: false,
};

describe( '<SignalBadge>', () => {
	it( 'renders nothing for a null signal', () => {
		const { container } = render( <SignalBadge signal={ null } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing for an undefined signal', () => {
		const { container } = render( <SignalBadge /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing for an empty signal (every field null/empty)', () => {
		const { container } = render( <SignalBadge signal={ baseSignal } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders the numeric_badge value as the badge (priority 1)', () => {
		const { container } = render( <SignalBadge signal={ { ...baseSignal, numeric_badge: 5 } } /> );
		const badge = container.querySelector( '.wp-admin-sidebar-item__badge' );
		expect( badge ).toBeInTheDocument();
		expect( badge ).toHaveTextContent( '5' );
	} );

	it( 'renders the count value when numeric_badge is null (priority 2 — issue #39 fix)', () => {
		const { container } = render( <SignalBadge signal={ { ...baseSignal, count: 3 } } /> );
		expect( container.querySelector( '.wp-admin-sidebar-item__badge' ) ).toHaveTextContent( '3' );
	} );

	it( 'renders the badge string when numeric paths are absent (priority 3)', () => {
		const { container } = render( <SignalBadge signal={ { ...baseSignal, badge: 'NEW' } } /> );
		expect( container.querySelector( '.wp-admin-sidebar-item__badge' ) ).toHaveTextContent( 'NEW' );
	} );

	it( 'numeric_badge wins over count when both are present', () => {
		const { container } = render(
			<SignalBadge signal={ { ...baseSignal, numeric_badge: 7, count: 99 } } />
		);
		expect( container.querySelector( '.wp-admin-sidebar-item__badge' ) ).toHaveTextContent( '7' );
	} );

	it( 'sets a numeric SR-only label on the badge for accessibility', () => {
		render( <SignalBadge signal={ { ...baseSignal, numeric_badge: 3 } } /> );
		const badge = screen.getByText( '3' );
		expect( badge ).toHaveAttribute( 'aria-label' );
		expect( badge.getAttribute( 'aria-label' ) ).toMatch( /3/ );
	} );

	it( 'allows overriding the badge SR label', () => {
		render(
			<SignalBadge signal={ { ...baseSignal, numeric_badge: 2 } } badgeLabel="2 plugin updates" />
		);
		expect( screen.getByText( '2' ) ).toHaveAttribute( 'aria-label', '2 plugin updates' );
	} );

	it( 'renders inline_text alongside the title', () => {
		const { container } = render(
			<SignalBadge signal={ { ...baseSignal, inline_text: 'Premium' } } />
		);
		const inlineText = container.querySelector( '.wp-admin-sidebar-item__inline-text' );
		expect( inlineText ).toHaveTextContent( 'Premium' );
	} );

	it( 'renders inline_icon as a dashicon span with aria-hidden', () => {
		const { container } = render(
			<SignalBadge signal={ { ...baseSignal, inline_icon: 'dashicons-warning' } } />
		);
		const inlineIcon = container.querySelector( '.wp-admin-sidebar-item__inline-icon' );
		expect( inlineIcon ).toBeInTheDocument();
		expect( inlineIcon ).toHaveClass( 'dashicons' );
		expect( inlineIcon ).toHaveClass( 'dashicons-warning' );
		expect( inlineIcon ).toHaveAttribute( 'aria-hidden', 'true' );
	} );

	it( 'renders numeric_badge AND inline_text together', () => {
		const { container } = render(
			<SignalBadge signal={ { ...baseSignal, numeric_badge: 2, inline_text: 'BETA' } } />
		);
		expect( container.querySelector( '.wp-admin-sidebar-item__badge' ) ).toHaveTextContent( '2' );
		expect( container.querySelector( '.wp-admin-sidebar-item__inline-text' ) ).toHaveTextContent(
			'BETA'
		);
	} );

	it( 'omits the badge when inline_text is the only signal', () => {
		const { container } = render(
			<SignalBadge signal={ { ...baseSignal, inline_text: 'BETA' } } />
		);
		expect( container.querySelector( '.wp-admin-sidebar-item__badge' ) ).not.toBeInTheDocument();
		expect( container.querySelector( '.wp-admin-sidebar-item__inline-text' ) ).toBeInTheDocument();
	} );

	it( 'accepts a pre-resolved signal and renders it verbatim', () => {
		const { container } = render(
			<SignalBadge
				resolved={ {
					badgeText: '12',
					inlineText: null,
					inlineIcon: null,
					hasAny: true,
				} }
			/>
		);
		expect( container.querySelector( '.wp-admin-sidebar-item__badge' ) ).toHaveTextContent( '12' );
	} );

	it( 'renders a multi-digit value (badge becomes a pill via min-width / radius)', () => {
		// We can't introspect computed styles in jsdom, but verify the text
		// content is preserved verbatim — the styling is asserted in the
		// stylesheet's snapshot.
		const { container } = render( <SignalBadge signal={ { ...baseSignal, numeric_badge: 99 } } /> );
		expect( container.querySelector( '.wp-admin-sidebar-item__badge' ) ).toHaveTextContent( '99' );
	} );
} );
