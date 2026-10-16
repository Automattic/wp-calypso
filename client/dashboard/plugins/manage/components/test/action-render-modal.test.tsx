/**
 * @jest-environment jsdom
 */

import { act, cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useState } from 'react';
import { render } from '../../../../test-utils';
import ActionRenderModal from '../action-render-modal';
import type { PluginListRow } from '../../types';
import type { ActionOnExecuteResponse } from '../action-render-modal';

const mockCancelSurvicateEvent = jest.fn();
const mockInvokeSurvicateEvent = jest.fn< () => void, [ string ] >(
	() => mockCancelSurvicateEvent
);

jest.mock( '@automattic/survicate', () => ( {
	invokeSurvicateEventAfterModalsClose: ( eventName: string ) =>
		mockInvokeSurvicateEvent( eventName ),
} ) );

const item = {
	id: 'test-plugin/test-plugin.php',
	name: 'Test Plugin',
	sitesCount: 1,
	siteIds: [ 1 ],
	sitesWithPluginActive: [ 1 ],
	sitesWithPluginInactive: [ 1 ],
	sitesWithPluginUpdate: [ 1 ],
	sitesWithPluginAutoupdated: [ 1 ],
	sitesWithPluginNotAutoupdated: [ 1 ],
} as unknown as PluginListRow;

const CONFIRM_LABELS: Record< string, string > = {
	activate: 'Activate',
	deactivate: 'Deactivate',
	update: 'Update',
	delete: 'Delete',
};

/**
 * Mounts the modal the way DataViews does: it stays mounted until `closeModal`
 * is called, then unmounts. `remountDuringAction` gives it a new key while the
 * action runs, as hosts with an inline `RenderModal` do when a refetch
 * re-renders them.
 */
function Host( {
	actionId,
	onExecute,
	remountDuringAction = false,
}: {
	actionId: string;
	onExecute: () => Promise< ActionOnExecuteResponse >;
	remountDuringAction?: boolean;
} ) {
	const [ isOpen, setIsOpen ] = useState( true );
	const [ instance, setInstance ] = useState( 0 );

	if ( ! isOpen ) {
		return <p>Modal closed</p>;
	}

	return (
		<ActionRenderModal
			key={ instance }
			actionId={ actionId }
			items={ [ item ] }
			closeModal={ () => setIsOpen( false ) }
			onExecute={ async () => {
				if ( remountDuringAction ) {
					setInstance( ( value ) => value + 1 );
				}
				return onExecute();
			} }
		/>
	);
}

async function confirm(
	actionId: string,
	{
		result = { successCount: 1, errorCount: 0 },
		remountDuringAction = false,
	}: { result?: ActionOnExecuteResponse; remountDuringAction?: boolean } = {}
) {
	render(
		<Host
			actionId={ actionId }
			onExecute={ () => Promise.resolve( result ) }
			remountDuringAction={ remountDuringAction }
		/>
	);

	await userEvent.click(
		await screen.findByRole( 'button', { name: CONFIRM_LABELS[ actionId ] } )
	);
	expect( await screen.findByText( 'Modal closed' ) ).toBeVisible();
}

const flushTimers = () => new Promise( ( resolve ) => setTimeout( resolve ) );

describe( '<ActionRenderModal>', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/me/sites' )
			.query( true )
			.reply( 200, { sites: [] } );
	} );

	afterEach( () => {
		mockInvokeSurvicateEvent.mockClear();
		mockCancelSurvicateEvent.mockClear();
	} );

	test.each( [
		[ 'activate', 'pluginActivated' ],
		[ 'deactivate', 'pluginDeactivated' ],
		[ 'update', 'pluginUpdated' ],
	] )( 'fires %s as %s once the modal closes after a success', async ( actionId, eventName ) => {
		await confirm( actionId );

		await waitFor( () => expect( mockInvokeSurvicateEvent ).toHaveBeenCalledWith( eventName ) );
		expect( mockInvokeSurvicateEvent ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'fires when the modal is remounted while the action runs', async () => {
		await confirm( 'activate', { remountDuringAction: true } );

		await waitFor( () =>
			expect( mockInvokeSurvicateEvent ).toHaveBeenCalledWith( 'pluginActivated' )
		);
		expect( mockInvokeSurvicateEvent ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'fires when the modal is closed before the action resolves', async () => {
		let resolveAction: ( result: ActionOnExecuteResponse ) => void = () => {};
		const { unmount } = render(
			<Host
				actionId="update"
				onExecute={ () => new Promise( ( resolve ) => ( resolveAction = resolve ) ) }
			/>
		);

		await userEvent.click( await screen.findByRole( 'button', { name: 'Update' } ) );
		unmount();
		await act( async () => resolveAction( { successCount: 1, errorCount: 0 } ) );

		expect( mockInvokeSurvicateEvent ).toHaveBeenCalledWith( 'pluginUpdated' );
		expect( mockInvokeSurvicateEvent ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'cancels the pending event of an earlier action', async () => {
		await confirm( 'update' );
		mockCancelSurvicateEvent.mockClear();

		cleanup();
		await confirm( 'activate' );

		expect( mockCancelSurvicateEvent ).toHaveBeenCalledTimes( 1 );
		expect( mockInvokeSurvicateEvent ).toHaveBeenLastCalledWith( 'pluginActivated' );
	} );

	test( 'does not fire when every site failed', async () => {
		await confirm( 'activate', { result: { successCount: 0, errorCount: 1 } } );
		await flushTimers();

		expect( mockInvokeSurvicateEvent ).not.toHaveBeenCalled();
	} );

	test( 'does not fire for other plugin actions', async () => {
		await confirm( 'delete' );
		await flushTimers();

		expect( mockInvokeSurvicateEvent ).not.toHaveBeenCalled();
	} );

	test( 'does not fire when the modal is cancelled', async () => {
		const onExecute = jest.fn();
		render( <Host actionId="activate" onExecute={ onExecute } /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Cancel' } ) );
		expect( await screen.findByText( 'Modal closed' ) ).toBeVisible();
		await flushTimers();

		expect( onExecute ).not.toHaveBeenCalled();
		expect( mockInvokeSurvicateEvent ).not.toHaveBeenCalled();
	} );
} );
