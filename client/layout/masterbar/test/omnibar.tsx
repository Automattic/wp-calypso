/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import Omnibar from '../omnibar';

/**
 * `#wpcom-omnibar` is a contract, not an implementation detail: `scrollToAnchor`,
 * `handleScroll`, and a dozen call sites under `client/dashboard/app/` look the
 * element up by that id. This test fails if the id is renamed or dropped.
 *
 * It does not cover the server-rendered copies in `client/document/index.jsx`,
 * which repeat the id as separate string literals.
 */

jest.mock( 'calypso/dashboard/app/omnibar/omnibar', () => () => <div>Omnibar contents</div> );

jest.mock( 'calypso/dashboard/app/omnibar/events', () => ( {
	omnibarEvents: {
		notificationsUnseenCount: { emit: jest.fn() },
		notificationsOpen: { emit: jest.fn() },
	},
	useOmnibarEvent: jest.fn(),
} ) );

jest.mock( 'calypso/my-sites/checkout/cart-manager-client', () => ( {
	cartManagerClient: {},
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => jest.fn(),
	useSelector: () => null,
} ) );

describe( 'Omnibar', () => {
	it( 'renders a wrapper with the id that scroll offset calculations look for', () => {
		const { container } = render( <Omnibar /> );

		expect( container.querySelector( '#wpcom-omnibar' ) ).not.toBeNull();
	} );
} );
