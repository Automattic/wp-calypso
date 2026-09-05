/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import PeopleListItem from '../index';
import type { Member, SiteDetails } from '@automattic/data-stores';
import type { ComponentType } from 'react';

jest.mock( '@automattic/data-stores', () => ( {
	useSendInvites: () => ( {
		isPending: false,
		mutateAsync: jest.fn(),
	} ),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	localize: ( Component: ComponentType ) => Component,
	translate: ( text: string ) => text,
	useTranslate: () => ( text: string ) => text,
} ) );

jest.mock( 'calypso/lib/site/utils', () => ( {
	userCan: () => true,
} ) );

jest.mock( 'calypso/my-sites/people/people-profile', () => () => <span>User profile</span> );

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => jest.fn(),
	useSelector: () => false,
} ) );

jest.mock( 'calypso/state/analytics/actions', () => ( {
	composeAnalytics: jest.fn(),
	recordGoogleEvent: jest.fn(),
} ) );

jest.mock( 'calypso/state/analytics/actions/record', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/state/invites/actions', () => ( {
	requestSiteInvites: jest.fn(),
} ) );

jest.mock( 'calypso/state/notices/actions', () => ( {
	createNotice: jest.fn(),
	removeNotice: jest.fn(),
} ) );

jest.mock( 'calypso/state/sites/selectors', () => ( {
	isSimpleSite: jest.fn(),
} ) );

describe( 'PeopleListItem', () => {
	test( 'links team members by user ID', () => {
		const user = {
			ID: 123,
			login: 'Bug Repro User',
			roles: [ 'author' ],
		} as Member;
		const site = {
			ID: 456,
			slug: 'example.wordpress.com',
			capabilities: { promote_users: true },
		} as SiteDetails;

		render( <PeopleListItem site={ site } user={ user } /> );

		expect( screen.getByRole( 'link' ) ).toHaveAttribute(
			'href',
			'/people/edit/example.wordpress.com/user/123'
		);
	} );
} );
