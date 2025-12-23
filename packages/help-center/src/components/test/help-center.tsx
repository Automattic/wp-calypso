/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import HelpCenter from '../help-center';

jest.mock( '@automattic/calypso-analytics', () => ( {
	initializeAnalytics: jest.fn(),
} ) );

jest.mock( '@automattic/odie-client/src/data/use-get-support-interactions', () => ( {
	useGetSupportInteractions: () => ( {
		data: [],
		isLoading: false,
	} ),
} ) );

jest.mock( '@automattic/zendesk-client', () => ( {
	useCanConnectToZendeskMessaging: () => ( {
		data: false,
	} ),
} ) );

jest.mock( '../help-center-container', () => ( {
	__esModule: true,
	default: () => <div>help-center-container</div>,
} ) );

jest.mock( '../help-center-smooch', () => ( {
	__esModule: true,
	default: () => <div>help-center-smooch</div>,
} ) );

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( selector: ( select: any ) => unknown ) =>
		selector( () => ( {
			isHelpCenterShown: () => false,
		} ) ),
} ) );

jest.mock( '../../stores', () => ( {
	HELP_CENTER_STORE: 'help-center-store',
} ) );

jest.mock( '../../hooks', () => ( {
	useShouldUseUnifiedAgent: () => false,
	useChatStatus: () => ( {
		isEligibleForChat: false,
	} ),
} ) );

jest.mock( '@automattic/agents-manager', () => ( {
	__esModule: true,
	default: () => <div>unified-agent</div>,
	getUseUnifiedExperienceFromInlineData: () => undefined,
} ) );

// A minimal currentUser object; runtime shape is not important for this test.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const minimalCurrentUser: any = {
	ID: 1,
};

describe( 'HelpCenter portal cleanup', () => {
	it( 'does not throw when the portal node has been reparented before unmount', async () => {
		const { unmount } = render(
			<HelpCenter
				hidden={ false }
				currentRoute="/"
				handleClose={ jest.fn() }
				currentUser={ minimalCurrentUser }
				sectionName="test-section"
			/>
		);

		await waitFor( () => {
			expect( document.querySelector( '.help-center' ) ).not.toBeNull();
		} );

		const portal = document.querySelector( '.help-center' ) as HTMLDivElement | null;
		expect( portal ).not.toBeNull();

		// Simulate the portal being reparented away from document.body.
		const altParent = document.createElement( 'div' );
		document.body.appendChild( altParent );
		altParent.appendChild( portal as HTMLDivElement );

		expect( () => unmount() ).not.toThrow();
	} );
} );
