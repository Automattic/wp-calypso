/** @jest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import wpcom from 'calypso/lib/wp';
import { StepAddServerAddress } from '../step-add-server-address';
import { useSteps } from '../use-steps';

jest.mock( 'calypso/lib/wp', () => ( { req: { post: jest.fn() } } ) );
jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( '../help-link', () => ( { HelpLink: () => null } ) );

const onVerify = jest.fn();
const post = jest.mocked( wpcom.req.post );
let client: QueryClient;
let resolveRequest: ( response: { success: boolean; ssh_public_key?: string } ) => void;
let rejectRequest: ( error: Error ) => void;

beforeEach( () => {
	jest.clearAllMocks();
	client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
	post.mockImplementation(
		() =>
			new Promise( ( resolve, reject ) => {
				resolveRequest = resolve;
				rejectRequest = reject;
			} )
	);
} );
afterEach( () => client.clear() );

const ServerDetails = () => {
	const [ serverAddress, setServerAddress ] = useState( 'ssh.example' );
	const [ port, setPort ] = useState( 22 );
	return (
		<StepAddServerAddress
			siteId={ 123 }
			serverAddress={ serverAddress }
			port={ port }
			helpLink={ null }
			onServerAddressChange={ setServerAddress }
			onPortChange={ setPort }
			onVerify={ onVerify }
			isInputDisabled={ false }
		/>
	);
};
const AccessDetails = () => {
	const { steps } = useSteps( {
		fromUrl: 'https://source.example',
		siteId: 123,
		siteName: 'Destination',
		onNoSSHAccess: jest.fn(),
		onAskForHelp: jest.fn(),
		isTransferring: false,
		isTransferReady: true,
		isTransferFailed: false,
		isInputDisabled: false,
	} );
	return (
		<>
			{ steps.map( ( step ) => (
				<div key={ step.task.id }>{ step.expandable?.content }</div>
			) ) }
		</>
	);
};

it.each( [ 'success', 'error' ] )(
	'locks server identity until verification returns %s',
	async ( outcome ) => {
		render(
			<QueryClientProvider client={ client }>
				<ServerDetails />
			</QueryClientProvider>
		);
		fireEvent.click( screen.getByRole( 'button', { name: 'Verify server address' } ) );
		await waitFor( () => expect( post ).toHaveBeenCalledTimes( 1 ) );
		expect( screen.getByLabelText( 'Server address' ) ).toBeDisabled();
		expect( screen.getByLabelText( 'Port' ) ).toBeDisabled();
		await act( async () => {
			if ( outcome === 'success' ) {
				resolveRequest( { success: true } );
			} else {
				rejectRequest( new Error( 'Verification failed' ) );
			}
		} );
		await waitFor( () => expect( screen.getByLabelText( 'Server address' ) ).toBeEnabled() );
		expect( screen.getByLabelText( 'Port' ) ).toBeEnabled();
		expect( onVerify ).toHaveBeenCalledTimes( outcome === 'success' ? 1 : 0 );
		fireEvent.change( screen.getByLabelText( 'Server address' ), {
			target: { value: 'second.example' },
		} );
		fireEvent.change( screen.getByLabelText( 'Port' ), { target: { value: '2222' } } );
		fireEvent.click( screen.getByRole( 'button', { name: 'Verify server address' } ) );
		await waitFor( () =>
			expect( post ).toHaveBeenLastCalledWith(
				expect.objectContaining( {
					body: { host: 'second.example', port: '2222' },
				} )
			)
		);
	}
);

it.each( [ 'success', 'error' ] )(
	'locks SSH username while key generation returns %s',
	async ( outcome ) => {
		render(
			<QueryClientProvider client={ client }>
				<AccessDetails />
			</QueryClientProvider>
		);
		fireEvent.click( screen.getAllByRole( 'radio' )[ 1 ] );
		fireEvent.change( screen.getByLabelText( 'SSH username' ), {
			target: { value: 'first-user' },
		} );
		fireEvent.click( screen.getByRole( 'button', { name: 'Generate SSH key' } ) );
		await waitFor( () => expect( post ).toHaveBeenCalledTimes( 1 ) );
		expect( screen.getByLabelText( 'SSH username' ) ).toBeDisabled();
		for ( const radio of screen.getAllByRole( 'radio' ) ) {
			expect( radio ).toBeDisabled();
		}
		expect( screen.queryByRole( 'button', { name: 'Edit username' } ) ).not.toBeInTheDocument();
		await act( async () => {
			if ( outcome === 'success' ) {
				resolveRequest( { success: true, ssh_public_key: 'public-key' } );
			} else {
				rejectRequest( new Error( 'Configuration failed' ) );
			}
		} );
		if ( outcome === 'success' ) {
			fireEvent.click( await screen.findByRole( 'button', { name: 'Edit username' } ) );
		}
		await waitFor( () => expect( screen.getByLabelText( 'SSH username' ) ).toBeEnabled() );
		for ( const radio of screen.getAllByRole( 'radio' ) ) {
			expect( radio ).toBeEnabled();
		}
		fireEvent.change( screen.getByLabelText( 'SSH username' ), {
			target: { value: 'second-user' },
		} );
		fireEvent.click( screen.getByRole( 'button', { name: 'Generate SSH key' } ) );
		await waitFor( () =>
			expect( post ).toHaveBeenLastCalledWith(
				expect.objectContaining( {
					body: expect.objectContaining( { remote_user: 'second-user' } ),
				} )
			)
		);
	}
);

it.each( [ 'success', 'error' ] )(
	'locks the shared server context until key generation returns %s',
	async ( outcome ) => {
		render(
			<QueryClientProvider client={ client }>
				<AccessDetails />
			</QueryClientProvider>
		);
		fireEvent.change( screen.getByLabelText( 'Server address' ), {
			target: { value: 'ssh.example' },
		} );
		fireEvent.change( screen.getByLabelText( 'Port' ), { target: { value: '2222' } } );
		fireEvent.click( screen.getAllByRole( 'radio' )[ 1 ] );
		fireEvent.change( screen.getByLabelText( 'SSH username' ), {
			target: { value: 'first-user' },
		} );
		fireEvent.click( screen.getByRole( 'button', { name: 'Generate SSH key' } ) );
		await waitFor( () =>
			expect( post ).toHaveBeenCalledWith(
				expect.objectContaining( {
					body: expect.objectContaining( {
						remote_host: 'ssh.example',
						remote_port: '2222',
						remote_user: 'first-user',
					} ),
				} )
			)
		);
		expect( screen.getByLabelText( 'Server address' ) ).toBeDisabled();
		expect( screen.getByLabelText( 'Port' ) ).toBeDisabled();
		expect( screen.getByRole( 'button', { name: 'Verify server address' } ) ).toBeDisabled();
		await act( async () => {
			if ( outcome === 'success' ) {
				resolveRequest( { success: true, ssh_public_key: 'public-key' } );
			} else {
				rejectRequest( new Error( 'Configuration failed' ) );
			}
		} );
		await waitFor( () => expect( screen.getByLabelText( 'Server address' ) ).toBeEnabled() );
		expect( screen.getByLabelText( 'Port' ) ).toBeEnabled();
		fireEvent.change( screen.getByLabelText( 'Server address' ), {
			target: { value: 'second.example' },
		} );
		fireEvent.change( screen.getByLabelText( 'Port' ), { target: { value: '2200' } } );
		expect( screen.getByLabelText( 'Server address' ) ).toHaveValue( 'second.example' );
		expect( screen.getByLabelText( 'Port' ) ).toHaveValue( 2200 );
	}
);
