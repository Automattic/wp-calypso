/**
 * @vitest-environment jsdom
 * @vitest-environment-options { "url": "https://container-test.calypso.live" }
 */

import { HostingFeatures, type Site } from '@automattic/api-core';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { vi } from 'vitest';
import { render } from '../../../test-utils';
import ActivationCallout from '../activation';

vi.mock( '@automattic/calypso-config', () => {
	globalThis.window.configData = { env_id: 'dashboard-horizon' };
	globalThis.window.electron = {};
	return import( '../../../../../packages/calypso-config/src' );
} );

test( 'shows hosting eligibility in the standalone Desktop Dashboard without Redux', async () => {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1/sites/1/automated-transfers/eligibility' )
		.reply( 200, { is_eligible: false, errors: [ { code: 'non_admin_user' } ], warnings: {} } );
	render(
		<ActivationCallout
			site={ { ID: 1 } as Site }
			feature={ HostingFeatures.LOGS }
			tracksFeatureId="logs"
		/>
	);

	await userEvent.click( await screen.findByRole( 'button', { name: 'Activate' } ) );

	const dialog = await screen.findByRole( 'dialog', {
		name: 'Hosting features cannot be activated',
	} );
	expect( within( dialog ).getByText( 'Site administrator only' ) ).toBeVisible();
	expect(
		within( dialog ).getByRole( 'button', { name: 'Activate hosting features' } )
	).toBeDisabled();
} );
