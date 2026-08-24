/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import { screen } from '@testing-library/react';
import Apps from '..';
import { render } from '../../../test-utils';

jest.mock( '@automattic/calypso-config', () => {
	const fn = jest.fn( () => '' );
	return Object.assign( fn, {
		__esModule: true,
		default: fn,
		isEnabled: jest.fn( () => true ),
	} );
} );

jest.mock( '../apps-mobile-card', () => () => <div>Mobile app</div> );
jest.mock( '../apps-desktop-card', () => () => <div>Desktop app</div> );

const mockedIsEnabled = config.isEnabled as jest.MockedFunction< typeof config.isEnabled >;

describe( '<Apps />', () => {
	test( 'shows WordPress Agent before the downloadable apps', () => {
		mockedIsEnabled.mockReturnValue( true );
		render( <Apps /> );

		expect( screen.getByRole( 'heading', { name: 'AI & Apps' } ) ).toBeVisible();
		const agentLink = screen.getByRole( 'link', { name: /WordPress Agent/ } );
		expect( agentLink ).toHaveAttribute( 'href', '/me/apps/agent' );
		expect( screen.queryByRole( 'link', { name: 'MCP' } ) ).not.toBeInTheDocument();
		expect(
			agentLink.compareDocumentPosition( screen.getByText( 'Mobile app' ) ) &
				Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	} );

	test( 'does not show the agent entry when the feature is disabled', () => {
		mockedIsEnabled.mockReturnValue( false );
		render( <Apps /> );

		expect( screen.queryByRole( 'link', { name: /WordPress Agent/ } ) ).not.toBeInTheDocument();
	} );
} );
