/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { vi } from 'vitest';
import { updateBackupRetention } from 'calypso/state/rewind/retention/actions';
import getBackupCurrentSiteSize from 'calypso/state/rewind/selectors/get-backup-current-site-size';
import getBackupRetentionDays from 'calypso/state/rewind/selectors/get-backup-retention-days';
import getRewindBytesAvailable from 'calypso/state/rewind/selectors/get-rewind-bytes-available';
import BackupRetentionManagement from '../index';

const GB_IN_BYTES = 2 ** 30;
const EXAMPLE_SITE_SLUG = 'mysite.example';
const EXAMPLE_SITE_ID = 123;
const EXAMPLE_ADDON_STORAGE_INFO = {
	upsellSlug: 'jetpack_backup_storage_addon_10GB',
	originalPrice: 5,
	isPriceFetching: false,
	currencyCode: 'USD',
};

// Mock dependencies
vi.mock( 'react-redux', async () => ( {
	...( await vi.importActual( 'react-redux' ) ),
	useSelector: vi.fn( ( func ) => func() ),
	useDispatch: () => vi.fn(),
} ) );

vi.mock( 'i18n-calypso', async () => ( {
	...( await vi.importActual( 'i18n-calypso' ) ),
	useTranslate: vi.fn( () => ( text ) => text ),
} ) );

vi.mock( 'calypso/components/data/query-site-products', () => ( {
	default: () => 'query-site-products',
} ) );
vi.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: vi.fn().mockImplementation( () => EXAMPLE_SITE_ID ),
} ) );

vi.mock( 'calypso/state/rewind/selectors/is-requesting-rewind-policies', () => ( {
	default: vi.fn().mockImplementation( () => false ),
} ) );

vi.mock( 'calypso/state/rewind/selectors/is-requesting-rewind-size', () => ( {
	default: vi.fn().mockImplementation( () => false ),
} ) );

vi.mock( 'calypso/state/rewind/selectors/get-activity-log-visible-days', () => ( {
	default: vi.fn().mockImplementation( () => 30 ),
} ) );

vi.mock( 'calypso/state/rewind/selectors/get-backup-retention-days', () => ( {
	default: vi.fn().mockImplementation( () => 30 ),
} ) );

vi.mock( 'calypso/state/rewind/selectors/get-rewind-bytes-available', () => ( {
	default: vi.fn().mockImplementation( () => 10 * GB_IN_BYTES ),
} ) );

vi.mock( 'calypso/state/rewind/selectors/get-backup-retention-update-status', () => ( {
	default: vi.fn().mockImplementation( () => 'unsubmitted' ),
} ) );

vi.mock( 'react-redux', async () => ( {
	...( await vi.importActual( 'react-redux' ) ),
	useSelector: vi.fn().mockImplementation( ( selector ) => selector() ),
	useDispatch: vi.fn().mockImplementation( () => () => {} ),
} ) );

vi.mock( 'calypso/state/rewind/selectors/get-backup-current-site-size', () => ( {
	default: vi.fn().mockImplementation( () => GB_IN_BYTES ),
} ) );

vi.mock( 'calypso/state/sites/selectors/get-site-slug', () => ( {
	default: vi.fn().mockImplementation( () => EXAMPLE_SITE_SLUG ),
} ) );

vi.mock( 'calypso/components/backup-storage-space/usage-warning/use-upsell-slug', () => ( {
	default: vi.fn().mockImplementation( () => EXAMPLE_ADDON_STORAGE_INFO ),
} ) );

describe( 'BackupRetentionManagement', () => {
	describe( 'purchase and update flow', () => {
		beforeEach( () => {
			vi.clearAllMocks();
		} );

		test( 'should not update automatically when storagePurchased prop is not passed', () => {
			const retentionSelected = 7;
			const retentionOptionName = /7 days/;

			// Mock dispatch
			const mockedDispatch = vi.fn();
			useDispatch.mockReturnValue( mockedDispatch );

			// Render component
			render( <BackupRetentionManagement defaultRetention={ retentionSelected } /> );

			// Ensure the retention passed is checked
			expect( screen.getByRole( 'radio', { name: retentionOptionName } ) ).toBeChecked();

			// Ensure the retention passed is not being updated automatically
			expect( mockedDispatch ).not.toHaveBeenCalledWith(
				updateBackupRetention( EXAMPLE_SITE_ID, retentionSelected )
			);
		} );

		test( 'should not update automatically when storagePurchased prop is false', () => {
			const retentionSelected = 7;
			const retentionOptionName = /7 days/;

			// Mock dispatch
			const mockedDispatch = vi.fn();
			useDispatch.mockReturnValue( mockedDispatch );

			// Render component
			render(
				<BackupRetentionManagement
					defaultRetention={ retentionSelected }
					storagePurchased={ false }
				/>
			);

			// Ensure the retention passed is checked
			expect( screen.getByRole( 'radio', { name: retentionOptionName } ) ).toBeChecked();

			// Ensure the retention passed is not being updated automatically
			expect( mockedDispatch ).not.toHaveBeenCalledWith(
				updateBackupRetention( EXAMPLE_SITE_ID, retentionSelected )
			);
		} );

		test( 'should update automatically when storagePurchased is true, the retention is not the current plan and not requires upgrade', () => {
			const retentionSelected = 30;
			const retentionOptionName = /30 days/;

			// Set current plan to 7 days, so it differ from the retention selected
			getBackupRetentionDays.mockReturnValue( 7 );

			// Set storage limit to 100 GB
			getRewindBytesAvailable.mockReturnValue( 100 * GB_IN_BYTES );

			// Set site size to 1 GB, so it does not require upgrade for 30 days with 100 GB
			getBackupCurrentSiteSize.mockReturnValue( GB_IN_BYTES );

			// Mock dispatch
			const mockedDispatch = vi.fn();
			useDispatch.mockReturnValue( mockedDispatch );

			// Render component
			render(
				<BackupRetentionManagement defaultRetention={ retentionSelected } storagePurchased />
			);

			// Ensure the retention passed is checked
			expect( screen.getByRole( 'radio', { name: retentionOptionName } ) ).toBeChecked();

			// Ensure the retention passed is being updated automatically
			expect( mockedDispatch ).toHaveBeenCalledWith(
				updateBackupRetention( EXAMPLE_SITE_ID, retentionSelected )
			);
		} );

		test( 'should not update automatically when storagePurchased is true and retention passed is current plan', () => {
			const retentionSelected = 30;
			const retentionOptionName = /30 days/;

			// Set current plan to 30 days, so it is the same from the retention selected
			getBackupRetentionDays.mockReturnValue( 30 );

			// Mock dispatch
			const mockedDispatch = vi.fn();
			useDispatch.mockReturnValue( mockedDispatch );

			// Render component
			render(
				<BackupRetentionManagement defaultRetention={ retentionSelected } storagePurchased />
			);

			// Ensure the retention passed is checked
			expect( screen.getByRole( 'radio', { name: retentionOptionName } ) ).toBeChecked();

			// Ensure the retention passed is not being updated automatically
			expect( mockedDispatch ).not.toHaveBeenCalledWith(
				updateBackupRetention( EXAMPLE_SITE_ID, retentionSelected )
			);
		} );

		/**
		 * There are cases where the storage purchased is not enough to cover the retention period selected.
		 * In those scenarios, we are not updating the retention automatically, and allowing the user to purchase additional storage.
		 */
		test( 'should not update automatically when storagePurchased is true and retention passed requires upgrade', () => {
			const retentionSelected = 30;
			const retentionOptionName = /30 days/;

			// Set current plan to 7 days, so it is different from the retention selected
			getBackupRetentionDays.mockReturnValue( 7 );

			// Set storage limit to 10 GB
			getRewindBytesAvailable.mockReturnValue( 10 * GB_IN_BYTES );

			// Set site size to 1 GB, so it will require upgrade for 30 days with 10 GB
			getBackupCurrentSiteSize.mockReturnValue( GB_IN_BYTES );

			// Mock dispatch
			const mockedDispatch = vi.fn();
			useDispatch.mockReturnValue( mockedDispatch );

			// Render component
			render(
				<BackupRetentionManagement defaultRetention={ retentionSelected } storagePurchased />
			);

			// Ensure the retention passed is checked
			expect( screen.getByRole( 'radio', { name: retentionOptionName } ) ).toBeChecked();

			// CTA button should say `Purchase and update`
			expect( screen.getByRole( 'button', { name: 'Purchase and update' } ) ).toBeInTheDocument();

			// Ensure the retention passed is not being updated automatically
			expect( mockedDispatch ).not.toHaveBeenCalledWith(
				updateBackupRetention( EXAMPLE_SITE_ID, retentionSelected )
			);
		} );
	} );
} );
