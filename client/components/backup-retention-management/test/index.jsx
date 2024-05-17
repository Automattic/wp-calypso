/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { useDispatch } from 'react-redux';
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
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn( ( func ) => func() ),
	useDispatch: () => jest.fn(),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate: jest.fn( () => ( text ) => text ),
} ) );

jest.mock( 'calypso/components/data/query-site-products', () => () => 'query-site-products' );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: jest.fn().mockImplementation( () => EXAMPLE_SITE_ID ),
} ) );

jest.mock( 'calypso/state/rewind/selectors/is-requesting-rewind-policies', () =>
	jest.fn().mockImplementation( () => false )
);

jest.mock( 'calypso/state/rewind/selectors/is-requesting-rewind-size', () =>
	jest.fn().mockImplementation( () => false )
);

jest.mock( 'calypso/state/rewind/selectors/get-activity-log-visible-days', () =>
	jest.fn().mockImplementation( () => 30 )
);

jest.mock( 'calypso/state/rewind/selectors/get-backup-retention-days', () =>
	jest.fn().mockImplementation( () => 30 )
);

jest.mock( 'calypso/state/rewind/selectors/get-rewind-bytes-available', () =>
	jest.fn().mockImplementation( () => 10 * GB_IN_BYTES )
);

jest.mock( 'calypso/state/rewind/selectors/get-backup-retention-update-status', () =>
	jest.fn().mockImplementation( () => 'unsubmitted' )
);

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn().mockImplementation( ( selector ) => selector() ),
	useDispatch: jest.fn().mockImplementation( () => () => {} ),
} ) );

jest.mock( 'calypso/state/rewind/selectors/get-backup-current-site-size', () =>
	jest.fn().mockImplementation( () => GB_IN_BYTES )
);

jest.mock( 'calypso/state/sites/selectors/get-site-slug', () =>
	jest.fn().mockImplementation( () => EXAMPLE_SITE_SLUG )
);

jest.mock( 'calypso/components/backup-storage-space/usage-warning/use-upsell-slug', () =>
	jest.fn().mockImplementation( () => EXAMPLE_ADDON_STORAGE_INFO )
);

describe( 'BackupRetentionManagement', () => {
	describe( 'purchase and update flow', () => {
		beforeEach( () => {
			jest.clearAllMocks();
		} );

		test( 'should not update automatically when storagePurchased prop is not passed', () => {
			const retentionSelected = 7;
			const retentionOptionName = /7 days/;

			// Mock dispatch
			const mockedDispatch = jest.fn();
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
			const mockedDispatch = jest.fn();
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
			const mockedDispatch = jest.fn();
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
			const mockedDispatch = jest.fn();
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
			const mockedDispatch = jest.fn();
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
