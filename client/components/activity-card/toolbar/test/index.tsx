/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import Toolbar from '../index';

jest.mock( '../actions-button', () => () => <button>Actions</button> );
jest.mock( 'calypso/lib/jetpack/backup-utils', () => ( {
	isSuccessfulRealtimeBackup: () => true,
} ) );

describe( 'Toolbar extraContent', () => {
	it( 'renders extraContent as the last child', () => {
		const { container } = render(
			<Toolbar
				siteId={ 1 }
				activity={ { activityId: 'a' } as never }
				extraContent={ <span>Extra</span> }
			/>
		);
		const toolbar = container.firstElementChild as HTMLElement;
		expect( toolbar.lastElementChild ).toBe( screen.getByText( 'Extra' ) );
		expect( toolbar.firstElementChild ).toBe( screen.getByText( 'Actions' ) );
	} );
} );
