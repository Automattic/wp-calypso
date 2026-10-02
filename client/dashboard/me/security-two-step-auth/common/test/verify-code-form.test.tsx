/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { AUTH_QUERY_KEY } from '../../../../app/auth';
import { render } from '../../../../test-utils';
import VerifyCodeForm from '../verify-code-form';
import type { User } from '@automattic/api-core';

function mockValidateCode() {
	return nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/two-step/validate' )
		.reply( 200, { success: true } );
}

async function submitCode() {
	const user = userEvent.setup();
	await user.type( screen.getByRole( 'textbox', { name: 'Code' } ), '123456' );
	await user.click( screen.getByRole( 'button', { name: 'Enable' } ) );
}

describe( '<VerifyCodeForm>', () => {
	test( 'marks the cached user as having two-step once it is enabled', async () => {
		const scope = mockValidateCode();
		const onSuccess = jest.fn();
		const { queryClient } = render(
			<VerifyCodeForm actionType="enable-two-step" onSuccess={ onSuccess } />,
			{ user: { ID: 1, two_step_enabled: false } as User }
		);
		queryClient.setQueryData( AUTH_QUERY_KEY, { ID: 1, two_step_enabled: false } as User );

		await submitCode();

		await waitFor( () => expect( onSuccess ).toHaveBeenCalled() );
		expect( scope.isDone() ).toBe( true );
		expect( queryClient.getQueryData< User >( AUTH_QUERY_KEY )?.two_step_enabled ).toBe( true );
	} );

	test( 'leaves the cached user alone for a backup-code receipt', async () => {
		mockValidateCode();
		const onSuccess = jest.fn();
		const { queryClient } = render(
			<VerifyCodeForm actionType="create-backup-receipt" onSuccess={ onSuccess } />,
			{ user: { ID: 1, two_step_enabled: false } as User }
		);
		queryClient.setQueryData( AUTH_QUERY_KEY, { ID: 1, two_step_enabled: false } as User );

		await submitCode();

		await waitFor( () => expect( onSuccess ).toHaveBeenCalled() );
		expect( queryClient.getQueryData< User >( AUTH_QUERY_KEY )?.two_step_enabled ).toBe( false );
	} );
} );
