/**
 * @vitest-environment jsdom
 */
import { type Domain } from '@automattic/api-core';
import { emailForwardersQuery } from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import DomainEmailForwardingSettingsSummary from '../email-forwarding-summary';

const DOMAIN = 'example.com';
const LIST = `/emails?domainName=${ DOMAIN }`;
const ADD = `/emails/add-forwarder?domainName=${ DOMAIN }`;

const mockForward = ( mailbox: string, forwardAddress: string ) => ( {
	email: `${ mailbox }@${ DOMAIN }`,
	mailbox,
	domain: DOMAIN,
	forward_address: forwardAddress,
	active: true,
	created: 0,
} );

function renderSummary(
	status: number,
	forwards: ReturnType< typeof mockForward >[] | null = [],
	domainProps: Partial< Domain > = {}
) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/domains/${ DOMAIN }/email` )
		.query( true )
		.reply( status, { type: 'forward', forwards, mx_servers: null, max_forwards: 100 } );

	return render(
		<DomainEmailForwardingSettingsSummary
			domain={ { domain: DOMAIN, current_user_can_add_email: true, ...domainProps } as Domain }
		/>
	);
}

const getRow = () => screen.getByRole( 'link', { name: /Email forwarding/ } );

async function waitForStatus(
	queryClient: ReturnType< typeof render >[ 'queryClient' ],
	status: 'success' | 'error'
) {
	const { queryKey } = emailForwardersQuery( DOMAIN );
	await waitFor( () => expect( queryClient.getQueryState( queryKey )?.status ).toBe( status ) );
}

describe( '<DomainEmailForwardingSettingsSummary>', () => {
	test( 'counts each forwarding address once and links to the list', async () => {
		renderSummary( 200, [
			mockForward( 'me', 'a@other.com' ),
			mockForward( 'me', 'b@other.com' ),
			mockForward( 'info', 'a@other.com' ),
		] );

		expect( await screen.findByText( '2 forwarders' ) ).toBeVisible();
		expect( getRow() ).toHaveAttribute( 'href', LIST );
	} );

	test.each( [
		[ 'an empty list', [] ],
		[ 'no list', null ],
	] )( 'offers the add flow when the domain has %s of forwarders', async ( _, forwards ) => {
		renderSummary( 200, forwards );

		await waitFor( () => expect( getRow() ).toHaveAttribute( 'href', ADD ) );
		expect( screen.queryByText( /forwarder/ ) ).not.toBeInTheDocument();
	} );

	test( 'links to the list when the user cannot add email', async () => {
		const { queryClient } = renderSummary( 200, [], { current_user_can_add_email: false } );

		await waitForStatus( queryClient, 'success' );
		expect( getRow() ).toHaveAttribute( 'href', LIST );
	} );

	test( 'links to the list while the forwarders load and after they fail', async () => {
		const { queryClient } = renderSummary( 500 );

		expect( getRow() ).toHaveAttribute( 'href', LIST );

		await waitForStatus( queryClient, 'error' );
		expect( getRow() ).toHaveAttribute( 'href', LIST );
	} );
} );
