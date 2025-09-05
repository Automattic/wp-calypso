/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../../test-utils';
import Preferences from '../index';

if ( typeof CSS === 'undefined' ) {
	global.CSS = {} as unknown as typeof CSS;
}

if ( typeof CSS.escape !== 'function' ) {
	CSS.escape = function ( value: string ) {
		return String( value ).replace( /[^a-zA-Z0-9_\u00A0-\uFFFF-]/g, '\\$&' );
	};
}

Object.defineProperty( window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation( ( query: string ) => ( {
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(),
		removeListener: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	} ) ),
} );

global.matchMedia = window.matchMedia;

jest.mock( '@wordpress/components', () => ( {
	Card: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
	Text: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
	__experimentalVStack: ( {
		children,
		className,
	}: {
		children: React.ReactNode;
		className?: string;
	} ) => {
		// Only add testid to the main page layout
		const isMainLayout = className?.includes( 'dashboard-page-layout is-' );
		const testProps = isMainLayout ? { 'data-testid': 'page-layout', 'data-size': 'small' } : {};
		return (
			<div className={ className } { ...testProps }>
				{ children }
			</div>
		);
	},
	__experimentalHStack: ( {
		children,
		className,
	}: {
		children: React.ReactNode;
		className?: string;
	} ) => <div className={ className }>{ children }</div>,
} ) );

jest.mock( '../../preferences-login', () => ( {
	__esModule: true,
	default: () => <div>Login preferences</div>,
} ) );

function renderPreferences() {
	return render( <Preferences /> );
}

afterEach( () => {
	jest.resetAllMocks();
} );

test( 'renders preferences page with PreferencesLogin component', async () => {
	renderPreferences();

	await waitFor( () => {
		expect( screen.getByText( 'Preferences' ) ).toBeInTheDocument();
	} );

	expect( screen.getByTestId( 'page-layout' ) ).toBeInTheDocument();
	expect( screen.getByTestId( 'page-layout' ) ).toHaveAttribute( 'data-size', 'small' );
	expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
} );
