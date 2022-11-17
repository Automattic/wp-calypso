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
import { useStorageUsageText } from 'calypso/components/backup-storage-space/hooks';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

const GIGABYTE = 2 ** 30;
const TERABYTE = 2 ** 40;

function renderText( bytesUsed, bytesAvailable ) {
	const {
		result: { current: text },
	} = renderHook( () => useStorageUsageText( bytesUsed, bytesAvailable ) );

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
			const text = renderText( bytesUsed, 0 );
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
			const text = renderText( 0, bytesAvailable );
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
			const text = renderText( 0, bytesAvailable );
			expect( text ).toHaveTextContent( `${ expectedGB }GB` );
		}
	);

	test( "doesn't render available storage if availableBytes is undefined", () => {
		const text = renderText( GIGABYTE, undefined );
		expect( text ).toHaveTextContent( '1.0GB used' );
		expect( text ).not.toHaveTextContent( ' of ' );
	} );

	test( 'renders null if bytesUsed is undefined', () => {
		const text = renderText( undefined, GIGABYTE );
		expect( text ).toBeEmptyDOMElement();
	} );
} );
