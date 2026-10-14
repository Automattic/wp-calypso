/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import PressableCheckoutBack from '../pressable-checkout-back';

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { post: jest.fn() } },
} ) );
jest.mock( 'calypso/state', () => ( { useDispatch: () => jest.fn() } ) );
jest.mock( 'calypso/state/analytics/actions', () => ( { recordTracksEvent: jest.fn() } ) );

const post = wpcom.req.post as jest.Mock;
const assign = jest.fn();
const originalLocation = window.location;
const originalUrl =
	'https://my.pressable.com/titan_email/checkout_return?agency_id=42&quantity=2&signature=original';
const signedUrl = `${ originalUrl }&checkout_status=CANCELED&timestamp=123`;

function renderBack() {
	return render(
		<QueryClientProvider client={ new QueryClient() }>
			<PressableCheckoutBack agencyId={ 42 } afterPurchaseUrl={ originalUrl } />
		</QueryClientProvider>
	);
}

beforeAll( () => {
	Object.defineProperty( window, 'location', { value: { assign }, configurable: true } );
} );
afterAll( () => {
	Object.defineProperty( window, 'location', { value: originalLocation, configurable: true } );
} );
beforeEach( () => {
	jest.clearAllMocks();
	post.mockReset();
} );

it( 'signs CANCELED only after clicking, with the unchanged original cart URL', async () => {
	post.mockResolvedValue( { afterPurchaseUrl: signedUrl } );
	renderBack();
	expect( post ).not.toHaveBeenCalled();
	fireEvent.click( screen.getByRole( 'button', { name: 'Back to Pressable' } ) );
	await waitFor( () => expect( assign ).toHaveBeenCalledWith( signedUrl ) );
	expect( post ).toHaveBeenCalledWith( {
		apiNamespace: 'wpcom/v2',
		path: '/agency/pressable/titan-checkout-return',
		method: 'POST',
		body: { agency_id: 42, checkout_status: 'CANCELED', afterPurchaseUrl: originalUrl },
	} );
	expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_pressable_checkout_back', {
		retry: false,
	} );
} );

it( 'disables repeated clicks while the request is pending', async () => {
	let resolve: ( value: { afterPurchaseUrl: string } ) => void = () => {};
	post.mockReturnValue( new Promise( ( done ) => ( resolve = done ) ) );
	renderBack();
	const button = screen.getByRole( 'button', { name: 'Back to Pressable' } );
	fireEvent.click( button );
	fireEvent.click( button );
	await waitFor( () => expect( button ).toBeDisabled() );
	expect( post ).toHaveBeenCalledTimes( 1 );
	expect( assign ).not.toHaveBeenCalled();
	await act( async () => resolve( { afterPurchaseUrl: signedUrl } ) );
} );

it( 'shows an error and fetches a fresh signed result on another click', async () => {
	post
		.mockRejectedValueOnce( new Error( 'Unavailable.' ) )
		.mockResolvedValueOnce( { afterPurchaseUrl: `${ signedUrl }4` } );
	const { container } = renderBack();
	fireEvent.click( screen.getByRole( 'button', { name: 'Back to Pressable' } ) );
	await within( container ).findByText( 'We couldn’t return you to Pressable. Please try again.' );
	expect( assign ).not.toHaveBeenCalled();
	fireEvent.click( screen.getByRole( 'button', { name: 'Back to Pressable' } ) );
	await waitFor( () => expect( assign ).toHaveBeenCalledWith( `${ signedUrl }4` ) );
	expect( post ).toHaveBeenCalledTimes( 2 );
	expect( recordTracksEvent ).toHaveBeenLastCalledWith( 'calypso_a4a_pressable_checkout_back', {
		retry: true,
	} );
} );

it( 'does not navigate to an unsafe returned URL', async () => {
	post.mockResolvedValue( { afterPurchaseUrl: 'https://evil.test/checkout_return' } );
	const { container } = renderBack();
	fireEvent.click( screen.getByRole( 'button', { name: 'Back to Pressable' } ) );
	await within( container ).findByText( 'We couldn’t return you to Pressable. Please try again.' );
	expect( assign ).not.toHaveBeenCalled();
} );

it( 'ignores a result after leaving the checkout', async () => {
	let resolve: ( value: { afterPurchaseUrl: string } ) => void = () => {};
	post.mockReturnValue( new Promise( ( done ) => ( resolve = done ) ) );
	const { unmount } = renderBack();
	fireEvent.click( screen.getByRole( 'button', { name: 'Back to Pressable' } ) );
	await waitFor( () => expect( post ).toHaveBeenCalledTimes( 1 ) );
	unmount();
	await act( async () => resolve( { afterPurchaseUrl: signedUrl } ) );
	expect( assign ).not.toHaveBeenCalled();
} );
