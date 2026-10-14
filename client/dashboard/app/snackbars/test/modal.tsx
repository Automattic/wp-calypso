/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import { Modal } from '@wordpress/components';
import { dispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import Snackbars from '../index';

describe( 'Snackbars with an open modal', () => {
	// Snackbars and modals working together relies on a specific WordPress Modal behaviour
	// of skipping aria-live elements when it hides the page. The new test will catch if
	// that behaviour ever changes.
	test( 'keeps snackbars exposed to assistive technology', async () => {
		render(
			<QueryClientProvider client={ new QueryClient() }>
				<Snackbars />
				<Modal title="Change site address" onRequestClose={ jest.fn() }>
					Modal content
				</Modal>
			</QueryClientProvider>
		);

		act( () => {
			dispatch( noticesStore ).createErrorNotice( 'Network error', {
				type: 'snackbar',
				explicitDismiss: true,
			} );
		} );

		expect( screen.getByRole( 'dialog', { name: 'Change site address' } ) ).toBeVisible();
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Dismiss this notice' } ) ).toBeVisible()
		);
	} );
} );
