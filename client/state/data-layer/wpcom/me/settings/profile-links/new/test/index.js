/** @format */

/**
 * Internal dependencies
 */
import { addUserProfileLinks, handleAddError, handleAddSuccess } from '../';
import {
	addUserProfileLinks as addUserProfileLinksAction,
	addUserProfileLinksDuplicate,
	addUserProfileLinksError,
	addUserProfileLinksMalformed,
	addUserProfileLinksSuccess,
	receiveUserProfileLinks,
} from 'state/profile-links/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

const profileLinks = [
	{
		link_slug: 'wordpress-org',
		title: 'WordPress.org',
		value: 'https://wordpress.org/',
	},
	{
		link_slug: 'wordpress-com',
		title: 'WordPress.com',
		value: 'https://wordpress.com/',
	},
];
const error = {
	status: 403,
	message: 'An active access token must be used to query information about the current user.',
};

describe( 'addUserProfileLinks()', () => {
	test( 'should dispatch a POST HTTP request to the users new profile links endpoint', () => {
		const dispatch = jest.fn();
		const action = addUserProfileLinksAction( profileLinks );

		addUserProfileLinks( { dispatch }, action );

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith(
			http(
				{
					apiVersion: '1.2',
					method: 'POST',
					path: '/me/settings/profile-links/new',
					body: {
						links: action.profileLinks,
					},
				},
				action
			)
		);
	} );
} );

describe( 'handleAddSuccess()', () => {
	test( 'should dispatch user profile links add success and receive actions', () => {
		const dispatch = jest.fn();
		const data = { profile_links: profileLinks };

		handleAddSuccess( { dispatch }, null, data );

		expect( dispatch ).toHaveBeenCalledTimes( 2 );
		expect( dispatch ).toHaveBeenCalledWith( addUserProfileLinksSuccess( profileLinks ) );
		expect( dispatch ).toHaveBeenCalledWith( receiveUserProfileLinks( profileLinks ) );
	} );

	test( 'should dispatch user profile links add success and duplicate actions', () => {
		const dispatch = jest.fn();
		const data = {
			profile_links: [ profileLinks[ 0 ] ],
			duplicate: [ profileLinks[ 1 ] ],
		};

		handleAddSuccess( { dispatch }, null, data );

		expect( dispatch ).toHaveBeenCalledTimes( 2 );
		expect( dispatch ).toHaveBeenCalledWith( addUserProfileLinksSuccess( data.profile_links ) );
		expect( dispatch ).toHaveBeenCalledWith( addUserProfileLinksDuplicate( data.duplicate ) );
	} );

	test( 'should dispatch user profile links add success and malformed actions', () => {
		const dispatch = jest.fn();
		const data = {
			profile_links: [ profileLinks[ 0 ] ],
			malformed: [ profileLinks[ 1 ] ],
		};

		handleAddSuccess( { dispatch }, null, data );

		expect( dispatch ).toHaveBeenCalledTimes( 2 );
		expect( dispatch ).toHaveBeenCalledWith( addUserProfileLinksSuccess( data.profile_links ) );
		expect( dispatch ).toHaveBeenCalledWith( addUserProfileLinksMalformed( data.malformed ) );
	} );
} );

describe( 'handleAddError()', () => {
	test( 'should dispatch user profile links add error action', () => {
		const dispatch = jest.fn();

		handleAddError( { dispatch }, { profileLinks }, error );

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith( addUserProfileLinksError( profileLinks, error ) );
	} );
} );
