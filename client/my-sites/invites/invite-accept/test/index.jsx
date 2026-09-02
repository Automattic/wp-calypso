/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import InviteAccept from '../index';

const mockLoggedIn = jest.fn();
const mockLoggedOut = jest.fn();
let mockCurrentUser = null;

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUser: () => mockCurrentUser,
} ) );

jest.mock( 'calypso/state/dashboard/selectors', () => ( {
	hasDashboardOptIn: () => false,
} ) );

jest.mock( 'calypso/state/current-user/actions', () => ( {
	redirectToLogout: () => ( { type: 'REDIRECT_TO_LOGOUT' } ),
} ) );

jest.mock( 'calypso/state/ui/actions', () => ( {
	hideMasterbar: () => ( { type: 'HIDE_MASTERBAR' } ),
} ) );

jest.mock( 'calypso/state/notices/actions', () => ( {
	successNotice: () => ( { type: 'SUCCESS_NOTICE' } ),
	infoNotice: () => ( { type: 'INFO_NOTICE' } ),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: () => {},
} ) );

jest.mock( 'calypso/lib/wp', () => ( { req: { get: () => new Promise( () => {} ) } } ) );

jest.mock( 'calypso/components/locale-suggestions', () => () => null );

jest.mock( 'calypso/my-sites/invites/invite-accept-logged-in', () => ( {
	__esModule: true,
	default: ( props ) => {
		mockLoggedIn( props );
		return <div data-testid="logged-in-form" />;
	},
} ) );

jest.mock( 'calypso/my-sites/invites/invite-accept-logged-out', () => ( {
	__esModule: true,
	default: ( props ) => {
		mockLoggedOut( props );
		return <div data-testid="logged-out-form" />;
	},
} ) );

const SITE_ID = 12345;
const INVITE_KEY = 'abc123';
const SENT_TO = 'invited@example.com';

function buildInvite( { forceMatchingEmail, known = true } ) {
	return {
		invite: {
			invite_slug: INVITE_KEY,
			invite_date: '2026-08-24T00:00:00+00:00',
			blog_id: String( SITE_ID ),
			meta: {
				role: 'editor',
				sent_to: SENT_TO,
				force_matching_email: forceMatchingEmail,
				known,
			},
		},
		blog_details: { title: 'Example Site', domain: 'example.wordpress.com' },
		inviter: { ID: 1, name: 'Inviter' },
	};
}

function renderInvite( { forceMatchingEmail, known } = {} ) {
	const store = configureStore()( {} );

	return render(
		<Provider store={ store }>
			<InviteAccept
				siteId={ SITE_ID }
				inviteKey={ INVITE_KEY }
				activationKey="activation"
				authKey="auth"
				prefetchedInvite={ buildInvite( { forceMatchingEmail, known } ) }
			/>
		</Provider>
	);
}

describe( 'InviteAccept', () => {
	beforeEach( () => {
		mockCurrentUser = null;
		mockLoggedIn.mockClear();
		mockLoggedOut.mockClear();
	} );

	describe( 'logged out', () => {
		it( 'renders the form for an invite bound to a single address', () => {
			const { getByTestId } = renderInvite( { forceMatchingEmail: true } );

			expect( getByTestId( 'logged-out-form' ) ).toBeVisible();
		} );

		it( 'tells the form the invite is bound to a single address', () => {
			renderInvite( { forceMatchingEmail: true } );

			expect( mockLoggedOut ).toHaveBeenCalledWith(
				expect.objectContaining( { forceMatchingEmail: true } )
			);
		} );

		it( 'leaves the form unconstrained for an unbound invite', () => {
			renderInvite( { forceMatchingEmail: false } );

			expect( mockLoggedOut ).toHaveBeenCalledWith(
				expect.objectContaining( { forceMatchingEmail: false } )
			);
		} );
	} );

	describe( 'logged in', () => {
		it( 'flags a signed-in address that differs from the invited one', () => {
			mockCurrentUser = { email: 'someone.else@example.com' };
			renderInvite( { forceMatchingEmail: true } );

			expect( mockLoggedIn ).toHaveBeenCalledWith(
				expect.objectContaining( { forceMatchingEmail: true } )
			);
		} );

		it( 'does not flag a signed-in address that matches the invited one', () => {
			mockCurrentUser = { email: SENT_TO };
			renderInvite( { forceMatchingEmail: true } );

			expect( mockLoggedIn ).toHaveBeenCalledWith(
				expect.objectContaining( { forceMatchingEmail: false } )
			);
		} );

		it( 'does not flag an unbound invite', () => {
			mockCurrentUser = { email: 'someone.else@example.com' };
			renderInvite( { forceMatchingEmail: false } );

			expect( mockLoggedIn ).toHaveBeenCalledWith(
				expect.objectContaining( { forceMatchingEmail: false } )
			);
		} );
	} );
} );
