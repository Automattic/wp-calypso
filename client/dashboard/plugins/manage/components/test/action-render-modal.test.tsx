/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/survicate', () => ( {
	invokeSurvicateEvent: jest.fn(),
} ) );

jest.mock( '../../hooks/use-sites-by-id', () => ( {
	useSitesById: () => ( { isLoadingSites: false, sitesById: new Map() } ),
} ) );

jest.mock( '../../../../app/analytics', () => ( {
	useAnalytics: () => ( { recordTracksEvent: jest.fn() } ),
} ) );

import { invokeSurvicateEvent } from '@automattic/survicate';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActionRenderModal from '../action-render-modal';
import type { PluginListRow } from '../../types';

const mockInvokeSurvicateEvent = invokeSurvicateEvent as jest.Mock;

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
	const closeModal = jest.fn();
	const view = render(
		<ActionRenderModal
			actionId={ actionId }
			items={ [ item ] }
			closeModal={ closeModal }
			onExecute={ onExecute }
		/>
	);

	const buttons = screen.getAllByRole( 'button' );
	await userEvent.click( buttons[ buttons.length - 1 ] );
	await waitFor( () => expect( closeModal ).toHaveBeenCalled() );
	return view;
}

describe( 'ActionRenderModal Survicate events', () => {
	afterEach( () => {
		mockInvokeSurvicateEvent.mockReset();
	} );

	test.each( [
		[ 'activate', 'pluginActivated' ],
		[ 'deactivate', 'pluginDeactivated' ],
		[ 'update', 'pluginUpdated' ],
	] )( 'fires %s as %s once the modal unmounts after a success', async ( actionId, eventName ) => {
		const { unmount } = await confirm( actionId );

		expect( mockInvokeSurvicateEvent ).not.toHaveBeenCalled();
		unmount();
		expect( mockInvokeSurvicateEvent ).toHaveBeenCalledWith( eventName );
		expect( mockInvokeSurvicateEvent ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'does not fire when every site failed', async () => {
		const { unmount } = await confirm( 'activate', { successCount: 0, errorCount: 1 } );
		unmount();

		expect( mockInvokeSurvicateEvent ).not.toHaveBeenCalled();
	} );

	test( 'does not fire for other plugin actions', async () => {
		const { unmount } = await confirm( 'delete' );
		unmount();

		expect( mockInvokeSurvicateEvent ).not.toHaveBeenCalled();
	} );

	test( 'does not fire when the modal is cancelled', () => {
		const { unmount } = render(
			<ActionRenderModal
				actionId="activate"
				items={ [ item ] }
				closeModal={ jest.fn() }
				onExecute={ jest.fn() }
			/>
		);
		unmount();

		expect( mockInvokeSurvicateEvent ).not.toHaveBeenCalled();
	} );
} );
