/**
 * @jest-environment jsdom
 */

import {
	agencyQuery,
	agencyTeamActivateMemberMutation,
	queryClient,
} from '@automattic/api-queries';
import { MutationObserver } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import nock from 'nock';
import { agencyTeamAcceptInviteRoute, createAgencyRoutes } from '../agency';
import { rootRoute } from '../root';

const API_ROOT = 'https://public-api.wordpress.com';

function matchInviteUrl( pathname: string, search: Record< string, unknown > ) {
	const router = createRouter( {
		routeTree: rootRoute.addChildren( createAgencyRoutes() ),
		basepath: '/',
	} as never ) as unknown as {
		matchRoutes: ( location: {
			pathname: string;
			search: Record< string, unknown >;
		} ) => Array< { routeId: string; search: Record< string, unknown > } >;
	};

	return router.matchRoutes( { pathname, search } );
}

function validateSearch( search: Record< string, unknown > ) {
	const validate = agencyTeamAcceptInviteRoute.options.validateSearch as (
		search: Record< string, unknown >
	) => { agency_id?: number; invite_id?: number; secret?: string };
	return validate( search );
}

function runRootGuard( pathname: string ) {
	const beforeLoad = rootRoute.options.beforeLoad as unknown as ( options: {
		cause: string;
		context: { config: { supports: { agency: boolean } } };
		location: { pathname: string };
	} ) => Promise< void >;

	return beforeLoad( {
		cause: 'stay',
		context: { config: { supports: { agency: true } } },
		location: { pathname },
	} );
}

describe( 'agencyTeamAcceptInviteRoute', () => {
	beforeEach( () => {
		queryClient.clear();
	} );

	it( 'matches the address the invitation email links to', () => {
		const matches = matchInviteUrl( '/team/invite/accept', {
			agency_id: '5',
			invite_id: '7',
			secret: 'a-secret',
		} );

		expect( matches.at( -1 ) ).toMatchObject( {
			routeId: '/team/invite/accept',
			search: { agency_id: 5, invite_id: 7, secret: 'a-secret' },
		} );
	} );

	it( 'drops ids that are not positive numbers', () => {
		expect( validateSearch( { agency_id: 'abc', invite_id: '0' } ) ).toEqual( {
			agency_id: undefined,
			invite_id: undefined,
			secret: undefined,
		} );
	} );

	it( 'lets a user with no agency through to the invite', async () => {
		nock( API_ROOT )
			.get( '/wpcom/v2/agency' )
			.query( true )
			.reply( 200, { is_client_user: false } );

		await expect( runRootGuard( '/team/invite/accept' ) ).resolves.toBeUndefined();
	} );

	it( 'still sends a user with no agency to signup on other paths', async () => {
		nock( API_ROOT )
			.get( '/wpcom/v2/agency' )
			.query( true )
			.reply( 200, { is_client_user: false } );

		const redirect = await runRootGuard( '/overview' ).catch( ( error ) => error );

		expect( redirect ).toMatchObject( { isRedirect: true, href: '/signup' } );
	} );

	it( 'lets a new member into the dashboard even when a "no agency" answer was cached', async () => {
		// An earlier visit, before the invite was accepted, cached `hasAgency: false`.
		queryClient.setQueryData( agencyQuery().queryKey, { isClientUser: false, hasAgency: false } );
		nock( API_ROOT ).post( '/wpcom/v2/agency/5/user-invites/7' ).reply( 200, { success: true } );
		nock( API_ROOT )
			.get( '/wpcom/v2/agency' )
			.query( true )
			.reply( 200, [ { id: 5 } ] );

		await new MutationObserver( queryClient, agencyTeamActivateMemberMutation() ).mutate( {
			agencyId: 5,
			inviteId: 7,
			secret: 'a-secret',
		} );

		await expect( runRootGuard( '/overview' ) ).resolves.toBeUndefined();
	} );
} );
