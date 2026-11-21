/**
 * @jest-environment jsdom
 */

import { queryClient } from '@automattic/api-queries';
import nock from 'nock';
import { agencySignupFinishRoute } from '../agency';
import { rootRoute } from '../root';

const API_ROOT = 'https://public-api.wordpress.com';

function runBeforeLoad( searchStr: string ) {
	const beforeLoad = agencySignupFinishRoute.options.beforeLoad as unknown as ( options: {
		location: { searchStr: string };
	} ) => { signupData: unknown };

	return beforeLoad( { location: { searchStr } } );
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

describe( 'agencySignupFinishRoute', () => {
	beforeEach( () => {
		queryClient.clear();
		window.localStorage.clear();
	} );

	it( 'reads the answers the marketing site sends in the query string', () => {
		const { signupData } = runBeforeLoad(
			'?first_name=Ada&last_name=Lovelace&agency_name=Analytical%3Cb%3E&agency_url=Analytical.Example' +
				'&services_offered[]=design&services_offered[]=hosting&expansion_planned=Maybe' +
				'&phone_number=%2B44%20(20)%201234'
		);

		expect( signupData ).toMatchObject( {
			request: {
				first_name: 'Ada',
				last_name: 'Lovelace',
				agency_name: 'Analyticalb',
				agency_url: 'analytical.example',
				services_offered: [ 'design', 'hosting' ],
				expansion_planned: undefined,
				phone_number: '+44(20)1234',
				skip_hubspot: false,
			},
		} );
	} );

	it( 'falls back to the answers the classic signup form saved before login', () => {
		window.localStorage.setItem(
			'a4aSignupFormData',
			JSON.stringify( {
				firstName: 'Ada',
				lastName: 'Lovelace',
				agencyName: 'Analytical',
				servicesOffered: [ 'design' ],
				phone: { phoneNumber: '1234', phoneNumberFull: '+441234' },
				acquisition: { utm_source: 'newsletter' },
				skip_hubspot: true,
			} )
		);

		const { signupData } = runBeforeLoad( '' );

		expect( signupData ).toMatchObject( {
			request: {
				first_name: 'Ada',
				agency_name: 'Analytical',
				services_offered: [ 'design' ],
				phone_number: '+441234',
				skip_hubspot: true,
			},
			acquisition: { utm_source: 'newsletter' },
		} );
	} );

	it( 'sends the user to signup when there are no answers', () => {
		window.localStorage.setItem( 'a4aSignupFormData', 'not json' );

		let redirect: unknown;
		try {
			runBeforeLoad( '?first_name=Ada' );
		} catch ( error ) {
			redirect = error;
		}

		expect( redirect ).toMatchObject( {
			isRedirect: true,
			href: '/signup',
			reloadDocument: true,
			replace: true,
		} );
	} );

	it( 'lets a user with no agency through', async () => {
		nock( API_ROOT )
			.get( '/wpcom/v2/agency' )
			.query( true )
			.reply( 200, { is_client_user: false } );

		await expect( runRootGuard( '/signup/finish' ) ).resolves.toBeUndefined();
	} );
} );
