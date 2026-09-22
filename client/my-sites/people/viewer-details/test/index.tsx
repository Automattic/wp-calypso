/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import ViewerDetails from '../index';
import type { PropsWithChildren } from 'react';

let mockViewer: { data: { ID: number; invite_key: string } | undefined; isLoading: boolean };
const mockInvites = [
	{ key: 'first', invitedBy: { name: 'Previous inviter', login: 'previous' } },
];

jest.mock( 'i18n-calypso', () => ( { useTranslate: () => ( text: string ) => text } ) );
jest.mock( '@automattic/calypso-router', () => ( { back: jest.fn() } ) );
jest.mock( '@automattic/components', () => ( {
	Card: ( { children }: PropsWithChildren ) => <>{ children }</>,
} ) );
jest.mock( 'calypso/components/main', () => ( { children }: PropsWithChildren ) => (
	<>{ children }</>
) );
jest.mock( 'calypso/components/header-cake', () => ( { children }: PropsWithChildren ) => (
	<>{ children }</>
) );
jest.mock( 'calypso/components/empty-content', () => ( { title }: { title: string } ) => (
	<h2>{ title }</h2>
) );
jest.mock( 'calypso/components/data/query-site-invites', () => () => null );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => () => null );
jest.mock( 'calypso/lib/accept', () => jest.fn() );
jest.mock( 'calypso/components/localized-moment', () => ( {
	useLocalizedMoment: () => jest.requireActual( 'moment' ),
} ) );
jest.mock( 'calypso/data/viewers/use-viewer-query', () => () => mockViewer );
jest.mock( 'calypso/data/viewers/use-remove-viewer-mutation', () => () => ( {
	removeViewer: jest.fn(),
} ) );
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => jest.fn(),
	useSelector: ( selector: ( state: object ) => unknown ) => selector( {} ),
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( { getSelectedSite: () => ( { ID: 1 } ) } ) );
jest.mock( 'calypso/state/invites/selectors', () => ( {
	getAcceptedInvitesForSite: () => mockInvites,
} ) );
jest.mock( 'calypso/state/invites/actions', () => ( { deleteInvite: jest.fn() } ) );
jest.mock( 'calypso/state/analytics/actions', () => ( { recordGoogleEvent: jest.fn() } ) );
jest.mock(
	'calypso/my-sites/people/people-list-item',
	() =>
		( { user }: { user?: { ID: number } } ) => (
			<p>{ user ? `Viewer ${ user.ID }` : 'Loading viewer' }</p>
		)
);

test( 'shows not-found when loading finishes without a viewer', () => {
	mockViewer = { data: undefined, isLoading: true };
	const { rerender } = render( <ViewerDetails userId="42" /> );
	expect( screen.getByText( 'Loading viewer' ) ).toBeVisible();
	mockViewer = { data: undefined, isLoading: false };
	rerender( <ViewerDetails userId="42" /> );
	expect( screen.getByText( 'The requested subscriber does not exist.' ) ).toBeVisible();
} );

test( 'does not retain the previous viewer’s invitation after switching viewers', () => {
	mockViewer = { data: { ID: 42, invite_key: 'first' }, isLoading: false };
	const { rerender } = render( <ViewerDetails userId="42" /> );
	expect( screen.getByText( /Previous inviter/ ) ).toBeVisible();
	mockViewer = { data: { ID: 43, invite_key: 'missing' }, isLoading: false };
	rerender( <ViewerDetails userId="43" /> );
	expect( screen.getByText( 'Viewer 43' ) ).toBeVisible();
	expect( screen.queryByText( /Previous inviter/ ) ).not.toBeInTheDocument();
} );
