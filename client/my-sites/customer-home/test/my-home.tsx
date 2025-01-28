/**
 * @jest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import CustomerHome from '../main';

jest.mock( '../components/full-screen-launchpad', () => ( {
	FullScreenLaunchpad: ( { onClose }: { onClose: () => void } ) => (
		<div data-testid="launchpad">
			<button onClick={ onClose } data-testid="close-launchpad">
				Close Launchpad
			</button>
		</div>
	),
} ) );

jest.mock( '../components/home-content', () => () => (
	<div data-testid="home-content">Home Content</div>
) );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( str: string ) => str,
} ) );

jest.mock( 'calypso/components/main', () => ( { children }: { children: React.ReactNode } ) => (
	<div data-testid="main">{ children }</div>
) );

jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => () => null );

describe( 'Make sure CustomerHome render traditional home or Focused Launchpad', () => {
	it( 'should show HomeContent by default when showLaunchpadFirst is false', () => {
		render( <CustomerHome /> );

		expect( screen.getByTestId( 'home-content' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'launchpad' ) ).not.toBeInTheDocument();
	} );

	it( 'should show Launchpad when showLaunchpadFirst is true', async () => {
		render( <CustomerHome showLaunchpadFirst /> );

		expect( screen.getByTestId( 'launchpad' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'home-content' ) ).not.toBeInTheDocument();

		// Click the close button
		await act( async () => {
			screen.getByTestId( 'close-launchpad' ).click();
		} );

		// Verify HomeContent is now shown
		expect( screen.getByTestId( 'home-content' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'launchpad' ) ).not.toBeInTheDocument();
	} );
} );
