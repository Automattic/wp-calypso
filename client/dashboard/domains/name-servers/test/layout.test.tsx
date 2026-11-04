/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import { NameServersLayout } from '../layout';

jest.mock( '../../../app/breadcrumbs', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( '../../../components/inline-support-link', () => ( {
	__esModule: true,
	default: () => <span>Learn more</span>,
} ) );

const mockHasEnTranslation = jest.fn( () => true );
jest.mock( '@automattic/i18n-utils', () => ( {
	...jest.requireActual( '@automattic/i18n-utils' ),
	useHasEnTranslation: () => mockHasEnTranslation,
} ) );

describe( 'NameServersLayout', () => {
	afterEach( () => mockHasEnTranslation.mockReturnValue( true ) );

	it( 'describes what name servers do', () => {
		render( <NameServersLayout /> );

		expect(
			screen.getByText( /Name servers tell the internet where to find this domain name/ )
		).toBeVisible();
	} );

	it( 'keeps the previous description until the new one is translated', () => {
		mockHasEnTranslation.mockReturnValue( false );

		render( <NameServersLayout /> );

		expect( screen.queryByText( /Name servers tell the internet/ ) ).not.toBeInTheDocument();
		expect( screen.getByText( /Change the name servers for your domain/ ) ).toBeVisible();
	} );
} );
