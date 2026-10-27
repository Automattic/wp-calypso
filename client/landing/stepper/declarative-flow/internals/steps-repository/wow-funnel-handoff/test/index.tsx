/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
	getWowFunnelHandoffUrl,
	waitForWowFunnelReady,
} from 'calypso/landing/stepper/utils/wow-funnel';
import WowFunnelHandoff from '../index';
import type { ReactNode } from 'react';

const mockQueryParams = new URLSearchParams(
	'wow_funnel=default&siteSlug=example.wordpress.com&siteId=123'
);

jest.mock( '@automattic/onboarding', () => ( {
	Step: {
		Loading: ( { title }: { title: string } ) => <div>{ title }</div>,
		TopBar: () => null,
		Heading: ( { text, subText }: { text: string; subText?: string } ) => (
			<div>
				<h1>{ text }</h1>
				<p>{ subText }</p>
			</div>
		),
		CenteredColumnLayout: ( {
			heading,
			children,
		}: {
			heading: ReactNode;
			children: ReactNode;
		} ) => (
			<div>
				{ heading }
				{ children }
			</div>
		),
	},
} ) );

jest.mock( '@wordpress/react-i18n', () => ( {
	useI18n: () => ( { __: ( text: string ) => text } ),
} ) );

jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( 'calypso/components/loading', () => ( { title }: { title: string } ) => (
	<div>{ title }</div>
) );

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => mockQueryParams,
} ) );

const mockSetSiteSetupError = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( { setSiteSetupError: mockSetSiteSetupError } ),
} ) );

// Stand-ins: the real library builds its own data stores on import, which the mock above
// does not provide.
jest.mock( '@wordpress/components', () => ( {
	Button: ( { children, onClick }: { children: ReactNode; onClick: () => void } ) => (
		<button onClick={ onClick }>{ children }</button>
	),
	__experimentalHStack: ( { children }: { children: ReactNode } ) => <div>{ children }</div>,
} ) );

jest.mock( 'calypso/landing/stepper/stores', () => ( {
	SITE_STORE: 'automattic/site',
} ) );

jest.mock( '../../../../helpers/should-use-step-container-v2', () => ( {
	shouldUseStepContainerV2: () => true,
} ) );

// Only what the step calls. The helpers' own rules, including how a timeout is told from a
// failure, are covered in utils/test/wow-funnel.ts.
jest.mock( 'calypso/landing/stepper/utils/wow-funnel', () => ( {
	getWowFunnelSlug: ( queryParams: URLSearchParams ) => queryParams.get( 'wow_funnel' ),
	isKnownWowFunnel: ( slug: string | null ) => !! slug,
	getWowFunnelDest: () => 'editor',
	isWowFunnelWaitTimeout: ( error: unknown ) =>
		error instanceof Error && 'WowFunnelWaitTimeoutError' === error.name,
	logWowFunnelEvent: jest.fn(),
	waitForWowFunnelReady: jest.fn(),
	getWowFunnelHandoffUrl: jest.fn(),
} ) );

const mockWait = waitForWowFunnelReady as jest.Mock;
const mockHandoffUrl = getWowFunnelHandoffUrl as jest.Mock;

const EDITOR_URL = 'https://example.wordpress.com/wp-admin/site-editor.php';

describe( 'WowFunnelHandoff', () => {
	const originalLocation = window.location;
	const navigation = { submit: jest.fn() };
	const replace = jest.fn();

	const renderStep = () =>
		render(
			<WowFunnelHandoff navigation={ navigation } stepName="wow-funnel-handoff" flow="onboarding" />
		);

	beforeEach( () => {
		jest.clearAllMocks();
		mockHandoffUrl.mockResolvedValue( EDITOR_URL );
		Object.defineProperty( window, 'location', {
			configurable: true,
			value: { ...originalLocation, replace },
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', { configurable: true, value: originalLocation } );
	} );

	it( 'hands the customer to their site once it is ready', async () => {
		mockWait.mockResolvedValue( undefined );

		renderStep();

		await waitFor( () => expect( replace ).toHaveBeenCalledWith( EDITOR_URL ) );
		expect( navigation.submit ).not.toHaveBeenCalled();
	} );

	it( 'offers to wait again when the site is slow, instead of the error step', async () => {
		mockWait.mockRejectedValueOnce(
			Object.assign( new Error( 'Setting up your site is taking longer than expected.' ), {
				name: 'WowFunnelWaitTimeoutError',
			} )
		);

		renderStep();

		expect( await screen.findByText( 'Your site is almost ready' ) ).toBeInTheDocument();
		// Someone who has just paid is not sent to "contact support" for a slow build.
		expect( navigation.submit ).not.toHaveBeenCalled();
		expect( mockSetSiteSetupError ).not.toHaveBeenCalled();
		expect( replace ).not.toHaveBeenCalled();

		// The second wait succeeds, and the customer is on their way.
		mockWait.mockResolvedValueOnce( undefined );
		await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );

		await waitFor( () => expect( replace ).toHaveBeenCalledWith( EDITOR_URL ) );
		expect( mockWait ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'stops offering another wait after a couple, and sends the customer to the error step', async () => {
		const timeout = () =>
			Object.assign( new Error( 'Setting up your site is taking longer than expected.' ), {
				name: 'WowFunnelWaitTimeoutError',
			} );
		mockWait.mockImplementation( () => Promise.reject( timeout() ) );

		renderStep();

		// Two more waits are offered.
		for ( let retry = 1; retry <= 2; retry++ ) {
			await userEvent.click( await screen.findByRole( 'button', { name: 'Try again' } ) );
			await waitFor( () => expect( mockWait ).toHaveBeenCalledTimes( retry + 1 ) );
		}

		// The third timeout is not "slow" any more.
		await waitFor( () => expect( navigation.submit ).toHaveBeenCalledWith( { hasError: true } ) );
		expect( mockSetSiteSetupError ).toHaveBeenCalledWith(
			'wow_funnel_handoff',
			'Setting up your site is taking longer than expected.'
		);
	} );

	it( 'still sends a build that failed to the error step', async () => {
		mockWait.mockRejectedValueOnce(
			new Error( 'Something went wrong while setting up your site.' )
		);

		renderStep();

		await waitFor( () => expect( navigation.submit ).toHaveBeenCalledWith( { hasError: true } ) );
		expect( mockSetSiteSetupError ).toHaveBeenCalledWith(
			'wow_funnel_handoff',
			'Something went wrong while setting up your site.'
		);
		expect( screen.queryByText( 'Your site is almost ready' ) ).not.toBeInTheDocument();
	} );
} );
