/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileInfoCard from '../file-info-card';
import type { FileBrowserItem } from '../types';

const mockSetNodeCheckState = jest.fn();

jest.mock( '../file-browser-context', () => ( {
	useFileBrowserContext: () => ( {
		fileBrowserState: { setNodeCheckState: mockSetNodeCheckState },
		locale: 'en',
		notices: { showError: jest.fn(), showSuccess: jest.fn() },
	} ),
} ) );

jest.mock( '../use-backup-path-info-query', () => ( {
	useBackupPathInfoQuery: () => ( {
		isSuccess: true,
		isLoading: false,
		isError: false,
		data: { size: 0 },
	} ),
} ) );

jest.mock( '../use-prepare-download', () => ( {
	usePrepareDownload: () => ( { prepareDownload: jest.fn() } ),
} ) );

const item: FileBrowserItem = {
	name: 'a.php',
	type: 'code',
	hasChildren: false,
	period: '1792244301',
	manifestPath: '/wp-content/a.php',
};

const hint = 'To restore this backup, confirm that you understand it contains known threats.';

const renderCard = ( props: { isRestoreEnabled?: boolean; restoreDisabledHint?: string } ) => {
	const onRequestGranularRestore = jest.fn();
	render(
		<FileInfoCard
			siteId={ 123 }
			item={ item }
			rewindId={ 1792244435 }
			path="/wp-content/a.php"
			siteSlug="test-site"
			onTrackEvent={ jest.fn() }
			source="dashboard"
			onRequestGranularRestore={ onRequestGranularRestore }
			{ ...props }
		/>
	);
	return { onRequestGranularRestore };
};

afterEach( () => {
	mockSetNodeCheckState.mockClear();
} );

test( 'holds Restore back with the hint as its description', async () => {
	const user = userEvent.setup();
	const { onRequestGranularRestore } = renderCard( {
		isRestoreEnabled: true,
		restoreDisabledHint: hint,
	} );

	const restore = screen.getByRole( 'button', { name: 'Restore' } );
	expect( restore ).toHaveAttribute( 'aria-disabled', 'true' );
	expect( restore ).toHaveAccessibleDescription( hint );

	await user.click( restore );
	expect( onRequestGranularRestore ).not.toHaveBeenCalled();
	expect( mockSetNodeCheckState ).not.toHaveBeenCalled();
} );

test( 'restores the file when nothing holds Restore back', async () => {
	const user = userEvent.setup();
	const { onRequestGranularRestore } = renderCard( { isRestoreEnabled: true } );

	const restore = screen.getByRole( 'button', { name: 'Restore' } );
	expect( restore ).toBeEnabled();
	expect( restore ).not.toHaveAccessibleDescription();

	await user.click( restore );
	expect( onRequestGranularRestore ).toHaveBeenCalledWith( 'test-site', 1792244435 );
} );

test( 'keeps Restore disabled without the hint when restoring is not allowed', () => {
	renderCard( { isRestoreEnabled: false, restoreDisabledHint: hint } );

	const restore = screen.getByRole( 'button', { name: 'Restore' } );
	expect( restore ).toBeDisabled();
	expect( restore ).not.toHaveAccessibleDescription();
} );
