/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import Omnibar from '../omnibar';

// `#wpcom-omnibar` is a contract: `handleScroll` and `scrollToAnchor` measure the
// bar by that id, and break silently if it is renamed or dropped.

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
