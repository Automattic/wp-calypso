/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { render } from '../../../test-utils';
import { NameServersLayout } from '../layout';

vi.mock( '../../../app/breadcrumbs', () => ( {
	__esModule: true,
	default: () => null,
} ) );

vi.mock( '../../../components/inline-support-link', () => ( {
	__esModule: true,
	default: () => <span>Learn more</span>,
} ) );

const mockHasEnTranslation = vi.fn( () => true );
vi.mock( '@automattic/i18n-utils', async () => ( {
	...( await vi.importActual< typeof import( '@automattic/i18n-utils' ) >(
		'@automattic/i18n-utils'
	) ),
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
