/**
 * @vitest-environment jsdom
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

describe( 'NameServersLayout', () => {
	test( 'describes the page', () => {
		render( <NameServersLayout /> );

		expect( screen.getByText( /Change the name servers for your domain/ ) ).toBeVisible();
	} );
} );
