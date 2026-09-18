/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import Apps from '..';
import { render } from '../../../test-utils';

jest.mock( '../apps-mobile-card', () => () => <div>Mobile app</div> );
jest.mock( '../apps-desktop-card', () => () => <div>Desktop app</div> );

describe( '<Apps />', () => {
	test( 'shows the downloadable apps without WordPress Agent settings', () => {
		render( <Apps /> );

		expect( screen.getByRole( 'heading', { name: 'Apps' } ) ).toBeVisible();
		expect( screen.getByText( 'Mobile app' ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: /WordPress Agent/ } ) ).not.toBeInTheDocument();
	} );
} );
