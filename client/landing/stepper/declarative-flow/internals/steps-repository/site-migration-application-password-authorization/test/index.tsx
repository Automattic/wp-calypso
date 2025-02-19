/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import SiteMigrationApplicationPasswordAuthorization from '..';
import { StepProps } from '../../../types';
import { RenderStepOptions, mockStepProps, renderStep } from '../../test/helpers';

const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
	const combinedProps = { ...mockStepProps( props ) };
	return renderStep(
		<SiteMigrationApplicationPasswordAuthorization { ...combinedProps } />,
		renderOptions
	);
};

jest.mock( 'wpcom-proxy-request', () => jest.fn() );
jest.mock( 'calypso/landing/stepper/hooks/use-site-slug-param' );

const { getByRole, getByTestId, findByText } = screen;

const authorizationUrl = 'https://example.com/authorization.php?appId=123&appName=My%20App';
const encodedAuthorizationUrl = encodeURIComponent(
	'https://example.com/authorization.php?appId=123&appName=My%20App'
);
const sourceUrl = encodeURIComponent( 'https://example.com' );

describe( 'SiteMigrationApplicationPasswordAuthorization', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => {
		jest.clearAllMocks();
		( useSiteSlugParam as jest.Mock ).mockReturnValue( 'site-url.wordpress.com' );
	} );

	it( 'renders the loading state when the authorization is successful and the application password is not yet stored', async () => {
		( wpcomRequest as jest.Mock ).mockImplementation( () => new Promise( () => {} ) );

		const initialEntry = `/step?from=${ sourceUrl }&authorizationUrl=${ encodedAuthorizationUrl }&user_login=test&password=test`;
		render( {}, { initialEntry } );

		await waitFor( () => {
			expect( getByTestId( 'loading-ellipsis' ) ).toBeVisible();
		} );
	} );

	it( 'redirects to the next step when the application password is stored', async () => {
		const submit = jest.fn();
		const initialEntry = `/step?from=${ sourceUrl }&authorizationUrl=${ encodedAuthorizationUrl }&user_login=test&password=test`;

		( wpcomRequest as jest.Mock ).mockResolvedValue( {
			status: 200,
			body: {
				data: { status: 200 },
			},
		} );

		render( { navigation: { submit } }, { initialEntry } );
		await waitFor( () => {
			expect( submit ).toHaveBeenCalledWith( { action: 'migration-started' } );
		} );
	} );

	it( 'renders the error state when the application password fails to be stored', async () => {
		( wpcomRequest as jest.Mock ).mockRejectedValue( {
			status: 500,
			body: {
				code: 'no_ticket_found',
				message: 'No migration ticket found.',
				data: { status: 500 },
			},
		} );

		const initialEntry = `/step?from=${ sourceUrl }&authorizationUrl=${ encodedAuthorizationUrl }&user_login=test&password=test`;
		render( {}, { initialEntry } );

		const errorMessage = await findByText( /Get help/ );

		await waitFor( () => {
			expect( errorMessage ).toBeVisible();
		} );
	} );

	it( 'renders the alert notice when the authorization is rejected', async () => {
		const submit = jest.fn();
		const initialEntry = `/step?from=${ sourceUrl }&authorizationUrl=${ encodedAuthorizationUrl }&success=false`;
		render( { navigation: { submit } }, { initialEntry } );

		const errorMessage = await findByText(
			/We can't start your migration without your authorization. Please authorize WordPress.com in your WP Admin or share your credentials./
		);

		await waitFor( () => {
			expect( errorMessage ).toBeVisible();
		} );
	} );

	it( 'the authorization button redirects to the source URL when clicked', async () => {
		const submit = jest.fn();
		const initialEntry = `/step?from=${ sourceUrl }&authorizationUrl=${ encodedAuthorizationUrl }`;
		render( { navigation: { submit } }, { initialEntry } );

		await userEvent.click( getByRole( 'button', { name: 'Authorize access' } ) );

		expect( submit ).toHaveBeenCalledWith( { action: 'authorization', authorizationUrl } );
	} );

	it( 'the share credentials button redirects to the fallback credentials step', async () => {
		const submit = jest.fn();
		const initialEntry = `/step?from=${ sourceUrl }&authorizationUrl=${ encodedAuthorizationUrl }`;
		render( { navigation: { submit } }, { initialEntry } );

		await userEvent.click( getByRole( 'button', { name: 'Share credentials instead' } ) );

		expect( submit ).toHaveBeenCalledWith( { action: 'fallback-credentials', authorizationUrl } );
	} );
} );
