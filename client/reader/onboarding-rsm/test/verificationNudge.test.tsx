/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import VerificationNudge from '../verificationNudge';

// Expose the props in a way that lets us inspect and interact with them.
jest.mock( 'calypso/me/email-verification-banner', () => ( {
	__esModule: true,
	default: ( {
		customDescription,
		dialogCloseLabel,
		dialogCloseAction,
	}: {
		customDescription?: React.ReactNode;
		dialogCloseLabel?: React.ReactNode;
		dialogCloseAction?: () => void;
	} ) => (
		<div>
			<div data-testid="banner-description">{ customDescription }</div>
			<button data-testid="banner-close" onClick={ dialogCloseAction }>
				{ dialogCloseLabel }
			</button>
		</div>
	),
} ) );

// i18n-calypso's useTranslate is called inside VerificationNudge.
jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate:
		() => ( text: string, opts?: { components?: Record< string, React.ReactNode > } ) => {
			if ( ! opts?.components ) {
				return text;
			}
			// Return the link component so it ends up in the DOM.
			return opts.components.link;
		},
} ) );

describe( 'VerificationNudge', () => {
	const replaceMock = jest.fn();

	beforeEach( () => {
		replaceMock.mockClear();
		Object.defineProperty( window, 'location', {
			configurable: true,
			value: {
				pathname: '/reader',
				search: '',
				replace: replaceMock,
			},
		} );
	} );

	it( 'includes reloadSubscriptionOnboarding in the "click here" link href', () => {
		render( <VerificationNudge reloadParam="reloadSubscriptionOnboarding" /> );

		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute(
			'href',
			expect.stringContaining( 'reloadSubscriptionOnboarding=true' )
		);
	} );

	it( 'includes reloadInterestsOnboarding in the "click here" link href', () => {
		render( <VerificationNudge reloadParam="reloadInterestsOnboarding" /> );

		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute(
			'href',
			expect.stringContaining( 'reloadInterestsOnboarding=true' )
		);
	} );

	it( 'preserves existing query params in the reload link', () => {
		Object.defineProperty( window, 'location', {
			configurable: true,
			value: {
				pathname: '/reader',
				search: '?flags=reader%2Fonboarding-rsm%2Creader%2Fforce-onboarding',
				replace: replaceMock,
			},
		} );

		render( <VerificationNudge reloadParam="reloadSubscriptionOnboarding" /> );

		const href = screen.getByRole( 'link' ).getAttribute( 'href' ) ?? '';
		expect( href ).toContain( 'reloadSubscriptionOnboarding=true' );
		expect( href ).toContain( 'flags=' );
	} );

	it( 'calls window.location.replace with the reload URL when the "click here" link is clicked', async () => {
		const user = userEvent.setup();
		render( <VerificationNudge reloadParam="reloadSubscriptionOnboarding" /> );

		await user.click( screen.getByRole( 'link' ) );

		expect( replaceMock ).toHaveBeenCalledTimes( 1 );
		expect( replaceMock ).toHaveBeenCalledWith(
			expect.stringContaining( 'reloadSubscriptionOnboarding=true' )
		);
	} );

	it( 'calls window.location.replace with the reload URL when the dialog close action fires', async () => {
		const user = userEvent.setup();
		render( <VerificationNudge reloadParam="reloadInterestsOnboarding" /> );

		await user.click( screen.getByTestId( 'banner-close' ) );

		expect( replaceMock ).toHaveBeenCalledTimes( 1 );
		expect( replaceMock ).toHaveBeenCalledWith(
			expect.stringContaining( 'reloadInterestsOnboarding=true' )
		);
	} );
} );
