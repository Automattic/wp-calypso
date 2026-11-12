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

describe( 'NameServersLayout', () => {
	test( 'describes the page', () => {
		render( <NameServersLayout /> );

		expect( screen.getByText( /Change the name servers for your domain/ ) ).toBeVisible();
	} );
} );
