/**
 * @jest-environment jsdom
 */

const EXAMPLE_SITE_SLUG = 'mysite.example';

// Mock dependencies
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn().mockImplementation( ( selector ) => selector() ),
	useDispatch: jest.fn().mockImplementation( () => () => {} ),
} ) );
jest.mock( 'calypso/state/ui/selectors/get-selected-site-slug', () =>
	jest.fn().mockImplementation( () => EXAMPLE_SITE_SLUG )
);
jest.mock( 'calypso/lib/jetpack/is-jetpack-cloud' );
jest.mock( 'calypso/state/analytics/actions/record' );

import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import {
	useDaysOfBackupsSavedText,
	useStorageUsageText,
} from 'calypso/components/backup-storage-space/hooks';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

const GIGABYTE = 2 ** 30;
const TERABYTE = 2 ** 40;

function renderStorageUsageText( bytesUsed, bytesAvailable ) {
	const {
		result: { current: text },
	} = renderHook( () => useStorageUsageText( bytesUsed, bytesAvailable ) );

	const { container } = render( text );
	return container;
}

function renderDaysOfBackupsSavedText( daysOfBackupsSaved, siteSlug ) {
	const {
		result: { current: text },
	} = renderHook( () => useDaysOfBackupsSavedText( daysOfBackupsSaved, siteSlug ) );

	const { container } = render( text );
	return container;
}

describe( 'useStorageUsageText', () => {
	beforeEach( () => {
		isJetpackCloud.mockClear();
	} );

	test.each( [
		[ GIGABYTE, 1.0 ],
		[ GIGABYTE * 5.49, 5.5 ],
		[ GIGABYTE * 0.91, 0.9 ],
		[ TERABYTE + 1, 1024.0 ],
	] )(
		'renders used storage in gigabytes to one decimal place, rounded',
		( bytesUsed, expectedGB ) => {
			const text = renderStorageUsageText( bytesUsed, 0 );
			expect( text ).toHaveTextContent( `${ expectedGB.toFixed( 1 ) }GB` );
		}
	);

	test.each( [
		[ TERABYTE, 1 ],
		[ TERABYTE + 1, 1 ],
		[ TERABYTE * 4 - 1, 3 ],
		[ TERABYTE * 4, 4 ],
	] )(
		'shows available storage in integer terabytes if bytesAvailable is >= 1TB',
		( bytesAvailable, expectedTB ) => {
			const text = renderStorageUsageText( 0, bytesAvailable );
			expect( text ).toHaveTextContent( `${ expectedTB }TB` );
		}
	);

	test.each( [
		[ TERABYTE - 1, 1023 ],
		[ GIGABYTE, 1 ],
		[ GIGABYTE * 20 - 1, 19 ],
		[ GIGABYTE * 20, 20 ],
	] )(
		'shows available storage in integer gigabytes if bytesAvailable is < 1TB',
		( bytesAvailable, expectedGB ) => {
			const text = renderStorageUsageText( 0, bytesAvailable );
			expect( text ).toHaveTextContent( `${ expectedGB }GB` );
		}
	);

	test( "doesn't render available storage if availableBytes is undefined", () => {
		const text = renderStorageUsageText( GIGABYTE, undefined );
		expect( text ).toHaveTextContent( '1.0GB used' );
		expect( text ).not.toHaveTextContent( ' of ' );
	} );

	test( 'renders null if bytesUsed is undefined', () => {
		const text = renderStorageUsageText( undefined, GIGABYTE );
		expect( text ).toBeEmptyDOMElement();
	} );
} );

describe( 'useDaysOfBackupsSavedText', () => {
	beforeEach( () => {
		isJetpackCloud.mockClear();
	} );
	test.each( [ [ undefined ], [ 0 ] ] )(
		"doesn't render backups saved if daysOfBackupsSaved is undefined or 0",
		( daysOfBackupsSaved ) => {
			const text = renderDaysOfBackupsSavedText( daysOfBackupsSaved, 'site-slug' );
			expect( text ).toBeEmptyDOMElement();
		}
	);

	test( 'renders `1 day of backup saved` when passed daysOfBackupsSaved as 1', () => {
		const text = renderDaysOfBackupsSavedText( 1, 'site-slug' );
		expect( text ).toHaveTextContent( '1 day of backup saved' );
	} );

	test( 'renders `7 days of backups` saved when passed daysOfBackupsSaved as 7', () => {
		const text = renderDaysOfBackupsSavedText( 7, 'site-slug' );
		expect( text ).toHaveTextContent( '7 days of backups saved' );
	} );

	test( 'renders `7 days of backups saved` with link to activity log with site-slug', () => {
		const text = renderDaysOfBackupsSavedText( 7, 'site-slug' );
		expect( text.childNodes[ 0 ] ).toContainHTML(
			'<a href="/activity-log/site-slug?group=rewind">7 days of backups saved</a>'
		);
	} );
} );
