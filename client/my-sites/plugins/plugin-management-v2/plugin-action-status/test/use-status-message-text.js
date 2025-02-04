/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import {
	ACTIVATE_PLUGIN,
	DEACTIVATE_PLUGIN,
	DISABLE_AUTOUPDATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	REMOVE_PLUGIN,
	UPDATE_PLUGIN,
	INSTALL_PLUGIN,
} from 'calypso/lib/plugins/constants';
import {
	PLUGIN_INSTALLATION_ERROR,
	PLUGIN_INSTALLATION_IN_PROGRESS,
} from 'calypso/state/plugins/installed/status/constants';
import AllMessagesByAction from '../messages/by-action';
import useStatusMessageText from '../use-status-message-text';

jest.mock( '../messages/by-action', () => ( {
	__esModule: true,
	default: {
		INSTALL_PLUGIN: {
			inProgress: jest.fn(),
		},
	},
} ) );

const ALL_ACTIONS = [
	[ INSTALL_PLUGIN ],
	[ ACTIVATE_PLUGIN ],
	[ UPDATE_PLUGIN ],
	[ DEACTIVATE_PLUGIN ],
	[ REMOVE_PLUGIN ],
	[ ENABLE_AUTOUPDATE_PLUGIN ],
	[ DISABLE_AUTOUPDATE_PLUGIN ],
];

describe( 'useStatusMessageText', () => {
	it.each( ALL_ACTIONS )(
		'returns an action-agnostic failure message if `status` is an error and `hasOneStatus` is false',
		( action ) => {
			const {
				result: { current: oneSiteMessage },
			} = renderHook( () =>
				useStatusMessageText( {
					action,
					status: PLUGIN_INSTALLATION_ERROR,
					hasOneStatus: false,
					siteCount: 1,
				} )
			);

			expect( oneSiteMessage ).toBe( 'Failed on 1 site' );

			const {
				result: { current: manySitesMessage },
			} = renderHook( () =>
				useStatusMessageText( {
					action,
					status: PLUGIN_INSTALLATION_ERROR,
					hasOneStatus: false,
					siteCount: 4,
				} )
			);

			expect( manySitesMessage ).toBe( 'Failed on 4 sites' );
		}
	);

	it( 'returns the appropriate status message based on the given action, status, and site details', () => {
		AllMessagesByAction[ INSTALL_PLUGIN ][ PLUGIN_INSTALLATION_IN_PROGRESS ].mockReturnValue(
			() => 'Message'
		);

		const {
			result: { current: message },
		} = renderHook( () =>
			useStatusMessageText( {
				action: INSTALL_PLUGIN,
				status: PLUGIN_INSTALLATION_IN_PROGRESS,
				hasSelectedSite: true,
				hasOneStatus: true,
				siteCount: 2,
			} )
		);

		expect( message ).toBe( 'Message' );
		expect(
			AllMessagesByAction[ INSTALL_PLUGIN ][ PLUGIN_INSTALLATION_IN_PROGRESS ]
		).toHaveBeenCalledWith( { hasSelectedSite: true, siteCount: 2 } );
	} );
} );
