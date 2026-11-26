/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Toolbar from '../index';

vi.mock( '../actions-button', () => ( { default: () => <button>Actions</button> } ) );
vi.mock( 'calypso/lib/jetpack/backup-utils', () => ( {
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
