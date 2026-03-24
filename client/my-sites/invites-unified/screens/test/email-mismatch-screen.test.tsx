/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { EmailMismatchScreen } from '../email-mismatch-screen';

const mockCenteredColumnLayout = jest.fn(
	( {
		children,
		heading,
		topBar,
	}: {
		children: React.ReactNode;
		heading: React.ReactNode;
		topBar: React.ReactNode;
	} ) => (
		<div data-testid="step-layout">
			{ topBar }
			{ heading }
			{ children }
		</div>
	)
);

jest.mock(
	'@automattic/onboarding',
	() => ( {
		Step: {
			Heading: ( { text, subText }: { text: string; subText: string } ) => (
				<div data-testid="step-heading">
					<h1>{ text }</h1>
					<p>{ subText }</p>
				</div>
			),
			TopBar: ( { logo }: { logo?: React.ReactNode } ) => (
				<div data-testid="step-topbar">{ logo }</div>
			),
			CenteredColumnLayout: ( props: {
				children: React.ReactNode;
				heading: React.ReactNode;
				topBar: React.ReactNode;
				columnWidth: number;
				verticalAlign: string;
			} ) => mockCenteredColumnLayout( props ),
		},
	} ),
	{ virtual: true }
);

jest.mock( '@wordpress/url', () => ( {
	addQueryArgs: ( url: string, query: { email_address: string } ) =>
		`${ url }&email_address=${ encodeURIComponent( query.email_address ) }`,
} ) );

jest.mock( 'calypso/components/connect-screen/action-buttons', () => ( {
	ActionButtons: ( {
		primaryLabel,
		primaryOnClick,
	}: {
		primaryLabel: string;
		primaryOnClick: () => void;
	} ) => <button onClick={ primaryOnClick }>{ primaryLabel }</button>,
} ) );

jest.mock( 'calypso/components/data/document-head', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/layout/body-section-css-class', () => ( {
	__esModule: true,
	default: () => null,
} ) );

const mockRecordTracksEvent = jest.fn();
jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: ( ...args: unknown[] ) => mockRecordTracksEvent( ...args ),
} ) );

const mockNavigate = jest.fn();
jest.mock( 'calypso/lib/navigate', () => ( {
	navigate: ( url: string ) => mockNavigate( url ),
} ) );

jest.mock( 'calypso/lib/paths', () => ( {
	login: ( { redirectTo }: { redirectTo: string } ) =>
		`/log-in?redirect_to=${ encodeURIComponent( redirectTo ) }`,
} ) );

jest.mock( '../style.scss', () => ( {} ) );

describe( 'EmailMismatchScreen', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockCenteredColumnLayout.mockClear();
	} );

	test( 'passes centered layout props', () => {
		render(
			<EmailMismatchScreen
				inviteSentTo="invited@example.com"
				isKnownUser
				trackingProps={ { unified: true } }
			/>
		);

		expect( mockCenteredColumnLayout ).toHaveBeenCalled();
		expect( mockCenteredColumnLayout.mock.calls[ 0 ][ 0 ] ).toEqual(
			expect.objectContaining( {
				columnWidth: 4,
				verticalAlign: 'center',
			} )
		);
	} );

	test( 'shows sign in button label for known users', () => {
		render(
			<EmailMismatchScreen
				inviteSentTo="invited@example.com"
				isKnownUser
				trackingProps={ { unified: true } }
			/>
		);

		expect( screen.getByText( 'Sign in as invited@example.com' ) ).toBeVisible();
	} );

	test( 'shows register button label for unknown users', () => {
		render(
			<EmailMismatchScreen
				inviteSentTo="invited@example.com"
				isKnownUser={ false }
				trackingProps={ { unified: true } }
			/>
		);

		expect( screen.getByText( 'Register as invited@example.com' ) ).toBeVisible();
	} );

	test( 'tracks and navigates with invite email when button is clicked', async () => {
		const user = userEvent.setup();
		render(
			<EmailMismatchScreen
				inviteSentTo="invited@example.com"
				isKnownUser
				trackingProps={ { role: 'administrator', unified: true } }
			/>
		);

		await user.click( screen.getByRole( 'button', { name: 'Sign in as invited@example.com' } ) );

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_invite_accept_logged_in_sign_in_link_click',
			expect.objectContaining( { role: 'administrator', unified: true } )
		);
		expect( mockNavigate ).toHaveBeenCalledWith(
			expect.stringContaining( 'email_address=invited%40example.com' )
		);
	} );
} );
