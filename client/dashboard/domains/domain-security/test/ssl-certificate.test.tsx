/**
 * @vitest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { render } from '../../../test-utils';
import SslCertificate from '../ssl-certificate';
import type { Domain, SslDetails } from '@automattic/api-core';

const domainName = 'example.com';
const now = new Date( '2026-11-14T12:00:00Z' );

const lastError = {
	error_type: 'authorization failure',
	message: 'The certificate authority could not verify this domain.',
};

function renderCertificate( sslDetails: Partial< SslDetails >, domain: Partial< Domain > = {} ) {
	return render(
		<SslCertificate
			domainName={ domainName }
			domain={ { domain: domainName, ssl_status: 'pending', ...domain } as Domain }
			sslDetails={
				{
					certificate_provisioned: false,
					is_newly_registered: false,
					is_expired: false,
					failure_reasons: [],
					...sslDetails,
				} as SslDetails
			}
		/>
	);
}

describe( '<SslCertificate>', () => {
	beforeEach( () => {
		vi.useFakeTimers( { toFake: [ 'Date' ] } );
		vi.setSystemTime( now );
	} );

	afterEach( () => {
		vi.useRealTimers();
	} );

	test( 'shows the last error and lets the user retry when provisioning failed', async () => {
		renderCertificate(
			{ certificate_status: 'failed', last_error: lastError, next_attempt: null },
			{ ssl_status: 'failed' }
		);

		expect( await screen.findByText( 'SSL failed' ) ).toBeVisible();
		expect( screen.getByText( /have stopped retrying automatically/ ) ).toBeVisible();
		expect( screen.getByText( 'Last error:' ) ).toBeVisible();
		expect( screen.getByText( lastError.message ) ).toBeVisible();
		expect( screen.queryByText( 'Next attempt:' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Provision certificate' } ) ).toBeVisible();
	} );

	test( 'trusts the certificate details over a stale domain status', async () => {
		renderCertificate( { certificate_status: 'failed', last_error: lastError } );

		expect( await screen.findByText( 'SSL failed' ) ).toBeVisible();
		expect( screen.queryByText( 'SSL pending' ) ).not.toBeInTheDocument();
	} );

	test.each( [
		[ '2026-11-14 12:05:00', 'in 5 minutes' ],
		[ '2026-11-14 15:00:00', 'in 3 hours' ],
		[ '2026-11-18 12:00:00', 'in 4 days' ],
		[ '2026-11-14 11:00:00', 'soon' ],
	] )( 'shows the next attempt at %s as "%s"', async ( next_attempt, expected ) => {
		renderCertificate( { certificate_status: 'pending', last_error: lastError, next_attempt } );

		expect( await screen.findByText( 'SSL pending' ) ).toBeVisible();
		expect( screen.getByText( 'Next attempt:' ).parentElement ).toHaveTextContent(
			`Next attempt: ${ expected }`
		);
		expect( screen.getByText( lastError.message ) ).toBeVisible();
		expect( screen.getByText( /We will try again automatically/ ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Provision certificate' } ) ).toBeVisible();
	} );

	test( 'offers a retry without naming issues when a failed certificate has none', async () => {
		renderCertificate( { certificate_status: 'failed', last_error: null, next_attempt: null } );

		expect( await screen.findByText( 'SSL failed' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Provision certificate' } ) ).toBeVisible();
		expect( screen.queryByText( /Once you have fixed all the issues/ ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Last error:' ) ).not.toBeInTheDocument();
	} );

	test( 'shows the next attempt without an error when none was recorded', async () => {
		renderCertificate( {
			certificate_status: 'pending',
			last_error: null,
			next_attempt: '2026-11-14 12:30:00',
		} );

		expect( await screen.findByText( 'Next attempt:' ) ).toBeVisible();
		expect( screen.queryByText( 'Last error:' ) ).not.toBeInTheDocument();
		expect( screen.getByText( /There is an issue with your certificate/ ) ).toBeVisible();
		expect(
			screen.queryByRole( 'button', { name: 'Provision certificate' } )
		).not.toBeInTheDocument();
	} );

	test( 'shows no attempt details for an active certificate', async () => {
		renderCertificate( { certificate_provisioned: true, certificate_status: 'active' } );

		expect( await screen.findByText( 'SSL active' ) ).toBeVisible();
		expect( screen.queryByText( 'Next attempt:' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Last error:' ) ).not.toBeInTheDocument();
	} );
} );
