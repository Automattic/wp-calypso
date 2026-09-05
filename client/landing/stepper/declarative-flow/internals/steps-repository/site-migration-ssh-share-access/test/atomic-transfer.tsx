/** @jest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import SiteMigrationSshShareAccess from '..';
import { usePollSSHMigrationAtomicTransferQueryKey as getTransferQueryKey } from '../hooks/use-poll-ssh-migration-atomic-transfer';
import type { PropsWithChildren } from 'react';

jest.mock( 'calypso/lib/wp', () => ( { req: { get: jest.fn(), post: jest.fn() } } ) );
jest.mock( '@automattic/i18n-utils', () => ( {
	useLocale: () => 'en',
	localizeUrl: ( url: string ) => url,
} ) );
jest.mock( '@automattic/onboarding', () => ( {
	Step: {
		CenteredColumnLayout: ( { children }: PropsWithChildren ) => children,
		TopBar: () => null,
		Heading: () => null,
	},
} ) );
jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( 'calypso/state', () => ( { useDispatch: () => jest.fn() } ) );
jest.mock( 'calypso/state/sites/actions', () => ( { resetSite: jest.fn() } ) );
jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( 'calypso/landing/stepper/hooks/use-site', () => ( {
	useSite: () => ( { ID: 123, name: 'Destination' } ),
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => new URLSearchParams( 'from=https://source.example&transferId=456' ),
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-site-slug-param', () => ( {
	useSiteSlugParam: () => 'destination.wordpress.com',
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-submit-migration-ticket', () => ( {
	useSubmitMigrationTicket: () => ( { sendTicketAsync: jest.fn(), isPending: false } ),
} ) );
jest.mock( 'calypso/data/site-migration/landing/use-update-migration-status', () => ( {
	useUpdateMigrationStatus: () => ( { mutateAsync: jest.fn() } ),
} ) );
jest.mock( '../../site-migration-credentials/hooks/use-credentials-form', () => ( {} ) );
jest.mock( '../../site-migration-instructions/support-nudge', () => ( {
	SupportNudge: () => null,
} ) );
jest.mock( '../steps/help-link', () => ( { HelpLink: () => null } ) );
jest.mock( '../hooks/use-rotating-loading-messages', () => ( {
	useRotatingLoadingMessages: () => ( { buttonText: 'Continue' } ),
} ) );

const queryKey = getTransferQueryKey( 123, 456 );
const statusResponse = ( transfer_status: string ) => ( {
	blog_id: 123,
	transfer_id: 456,
	transfer_status,
} );
const post = jest.mocked( wpcom.req.post );
const get = jest.mocked( wpcom.req.get );
const callsTo = ( endpoint: string ) =>
	post.mock.calls.filter( ( [ request ]: [ { path: string } ] ) =>
		request.path.endsWith( endpoint )
	);
let client: QueryClient;
const submit = jest.fn();

beforeEach( () => {
	jest.clearAllMocks();
	client = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } },
	} );
	get.mockImplementation( () => new Promise( () => {} ) );
	post.mockResolvedValue( { success: true, ssh_public_key: 'public-key' } );
} );
afterEach( () => client.clear() );

const renderStep = ( status?: string ) => {
	if ( status ) {
		client.setQueryData( queryKey, statusResponse( status ) );
	}
	return render(
		<QueryClientProvider client={ client }>
			<SiteMigrationSshShareAccess
				navigation={ { submit } }
				flow="site-migration"
				stepName="site-migration-ssh-share-access"
			/>
		</QueryClientProvider>
	);
};

const completeForm = async ( authMethod: 'password' | 'key' ) => {
	fireEvent.click( screen.getByRole( 'button', { name: /Find your SSH details/ } ) );
	fireEvent.click( screen.getByRole( 'button', { name: 'I found my SSH details' } ) );
	fireEvent.change( screen.getByLabelText( 'Server address' ), {
		target: { value: 'ssh.example' },
	} );
	fireEvent.click( screen.getByRole( 'button', { name: 'Verify server address' } ) );
	await screen.findByLabelText( 'SSH username' );
	if ( authMethod === 'key' ) {
		fireEvent.click( screen.getAllByRole( 'radio' )[ 1 ] );
	}
	fireEvent.change( screen.getByLabelText( 'SSH username' ), { target: { value: 'user' } } );
	if ( authMethod === 'password' ) {
		fireEvent.change( screen.getByLabelText( 'SSH password' ), { target: { value: 'password' } } );
	}
};
const actionButton = ( authMethod: 'password' | 'key' ) =>
	screen.getByRole( 'button', {
		name: authMethod === 'password' ? 'Continue' : 'Generate SSH key',
	} );
const endpointFor = ( authMethod: 'password' | 'key' ) =>
	authMethod === 'password' ? '/start' : '/configure';
const setStatus = async ( status: string ) => {
	await act( async () => {
		client.setQueryData( queryKey, statusResponse( status ) );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
	} );
};

describe.each( [ 'password', 'key' ] as const )( '%s authentication', ( authMethod ) => {
	it.each( [ undefined, 'provisioning' ] )(
		'waits for completed when status is %s',
		async ( status ) => {
			renderStep( status );
			await completeForm( authMethod );
			fireEvent.click( actionButton( authMethod ) );
			await waitFor( () => expect( actionButton( authMethod ) ).toBeDisabled() );
			expect( callsTo( endpointFor( authMethod ) ) ).toHaveLength( 0 );
			await setStatus( 'completed' );
			expect( screen.queryByText( /problem preparing your site/ ) ).not.toBeInTheDocument();
			await waitFor( () => expect( callsTo( endpointFor( authMethod ) ) ).toHaveLength( 1 ) );
		}
	);

	it.each( [ 'failed', 'error', 'reverted' ] )(
		'settles queued work on %s without starting it',
		async ( status ) => {
			renderStep( 'provisioning' );
			await completeForm( authMethod );
			fireEvent.click( actionButton( authMethod ) );
			await setStatus( status );
			await waitFor( () => expect( actionButton( authMethod ) ).not.toHaveClass( 'is-busy' ) );
			expect( actionButton( authMethod ) ).toBeDisabled();
			expect( screen.getByLabelText( 'SSH username' ) ).toBeEnabled();
			expect( screen.getByText( /problem preparing your site/ ) ).toBeVisible();
			expect(
				screen.getByRole( 'button', { name: 'Need help? Let us migrate your site' } )
			).toBeEnabled();
			expect( callsTo( endpointFor( authMethod ) ) ).toHaveLength( 0 );
			fireEvent.click( actionButton( authMethod ) );
			expect( callsTo( endpointFor( authMethod ) ) ).toHaveLength( 0 );
			await setStatus( 'completed' );
			expect( screen.queryByText( /problem preparing your site/ ) ).not.toBeInTheDocument();
			expect( callsTo( endpointFor( authMethod ) ) ).toHaveLength( 0 );
			fireEvent.click( actionButton( authMethod ) );
			await waitFor( () => expect( callsTo( endpointFor( authMethod ) ) ).toHaveLength( 1 ) );
		}
	);

	it( 'clears queued intent on a polling error and allows an explicit retry after recovery', async () => {
		renderStep( 'provisioning' );
		await completeForm( authMethod );
		fireEvent.click( actionButton( authMethod ) );
		get.mockRejectedValueOnce( new Error( 'Network unavailable' ) );
		await act( async () => {
			await client.refetchQueries( { queryKey } );
		} );
		await waitFor( () => expect( actionButton( authMethod ) ).not.toHaveClass( 'is-busy' ) );
		expect( actionButton( authMethod ) ).toBeDisabled();
		expect( screen.getByLabelText( 'SSH username' ) ).toBeEnabled();
		expect( screen.getByText( /problem preparing your site/ ) ).toBeVisible();
		expect(
			screen.getByRole( 'button', { name: 'Need help? Let us migrate your site' } )
		).toBeEnabled();
		expect( callsTo( endpointFor( authMethod ) ) ).toHaveLength( 0 );
		await setStatus( 'completed' );
		expect( screen.queryByText( /problem preparing your site/ ) ).not.toBeInTheDocument();
		expect( callsTo( endpointFor( authMethod ) ) ).toHaveLength( 0 );
		fireEvent.click( actionButton( authMethod ) );
		await waitFor( () => expect( callsTo( endpointFor( authMethod ) ) ).toHaveLength( 1 ) );
	} );
} );

it( 'offers the existing assisted migration action after preparation fails', async () => {
	renderStep( 'failed' );
	await completeForm( 'password' );
	fireEvent.click( screen.getByRole( 'button', { name: 'Need help? Let us migrate your site' } ) );
	await waitFor( () => expect( submit ).toHaveBeenCalledWith( { destination: 'do-it-for-me' } ) );
	expect( callsTo( '/start' ) ).toHaveLength( 0 );
	expect( callsTo( '/configure' ) ).toHaveLength( 0 );
} );

it( 'preserves a migration error when atomic polling recovers', async () => {
	renderStep( 'completed' );
	await completeForm( 'password' );
	post.mockRejectedValueOnce( new Error( 'Migration could not start' ) );
	fireEvent.click( actionButton( 'password' ) );
	await screen.findByText( /problem starting the migration/ );
	get.mockRejectedValueOnce( new Error( 'Network unavailable' ) );
	await act( async () => {
		await client.refetchQueries( { queryKey } );
	} );
	await screen.findByText( /problem preparing your site/ );
	await setStatus( 'completed' );
	expect( screen.queryByText( /problem preparing your site/ ) ).not.toBeInTheDocument();
	expect( screen.getByText( /problem starting the migration/ ) ).toBeVisible();
} );

it.each( [ 'queued', 'in-progress' ] )(
	'ignores a late preparation error while SSH is %s',
	async ( status ) => {
		let rejectPreparation: ( error: Error ) => void = () => {};
		const preparation = new Promise( ( _resolve, reject ) => {
			rejectPreparation = reject;
		} );
		get.mockImplementation( ( request: { path: string } ) =>
			request.path.endsWith( '/status' )
				? Promise.resolve( { success: true, status, step: 'requested-migration' } )
				: preparation
		);
		renderStep( 'completed' );
		await completeForm( 'password' );
		let pendingRefetch: Promise< void > = Promise.resolve();
		act( () => {
			pendingRefetch = client.refetchQueries( { queryKey } );
		} );
		fireEvent.click( actionButton( 'password' ) );
		await waitFor( () =>
			expect( client.getQueryData( [ 'ssh-migration-status', 123 ] ) ).toEqual( {
				success: true,
				status,
				step: 'requested-migration',
			} )
		);
		await act( async () => {
			rejectPreparation( new Error( 'Late network failure' ) );
			await pendingRefetch;
		} );
		await waitFor( () => expect( client.getQueryState( queryKey )?.status ).toBe( 'error' ) );
		expect( screen.queryByText( /problem preparing your site/ ) ).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Need help? Let us migrate your site' } )
		).not.toBeInTheDocument();
		const previousCalls = get.mock.calls.length;
		await act( async () => {
			await client.refetchQueries( { queryKey } );
		} );
		expect( get ).toHaveBeenCalledTimes( previousCalls );
		expect( actionButton( 'password' ) ).toBeDisabled();
	}
);
