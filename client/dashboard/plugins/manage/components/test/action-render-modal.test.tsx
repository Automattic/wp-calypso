/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/survicate', () => ( {
	invokeSurvicateEventAfterModalsClose: jest.fn(),
} ) );

jest.mock( '../../hooks/use-sites-by-id', () => ( {
	useSitesById: () => ( { isLoadingSites: false, sitesById: new Map() } ),
} ) );

jest.mock( '../../../../app/analytics', () => ( {
	useAnalytics: () => ( { recordTracksEvent: jest.fn() } ),
} ) );

import { invokeSurvicateEventAfterModalsClose } from '@automattic/survicate';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActionRenderModal from '../action-render-modal';
import type { PluginListRow } from '../../types';

const mockInvokeSurvicateEvent = invokeSurvicateEventAfterModalsClose as jest.Mock;

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

async function confirm( actionId: string, result = { successCount: 1, errorCount: 0 } ) {
	const onExecute = jest.fn().mockResolvedValue( result );
	render(
		<ActionRenderModal
			actionId={ actionId }
			items={ [ item ] }
			closeModal={ jest.fn() }
			onExecute={ onExecute }
		/>
	);

	const buttons = screen.getAllByRole( 'button' );
	await userEvent.click( buttons[ buttons.length - 1 ] );
	await waitFor( () => expect( onExecute ).toHaveBeenCalled() );
}

describe( 'ActionRenderModal Survicate events', () => {
	afterEach( () => {
		mockInvokeSurvicateEvent.mockReset();
	} );

	test.each( [
		[ 'activate', 'pluginActivated' ],
		[ 'deactivate', 'pluginDeactivated' ],
		[ 'update', 'pluginUpdated' ],
	] )( 'fires %s as %s once the action succeeds', async ( actionId, eventName ) => {
		await confirm( actionId );

		await waitFor( () => expect( mockInvokeSurvicateEvent ).toHaveBeenCalledWith( eventName ) );
		expect( mockInvokeSurvicateEvent ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'does not fire when every site failed', async () => {
		await confirm( 'activate', { successCount: 0, errorCount: 1 } );

		expect( mockInvokeSurvicateEvent ).not.toHaveBeenCalled();
	} );

	test( 'does not fire for other plugin actions', async () => {
		await confirm( 'delete' );

		expect( mockInvokeSurvicateEvent ).not.toHaveBeenCalled();
	} );
} );
