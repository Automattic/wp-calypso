import { renderHook } from '@testing-library/react-hooks';
import { useStorageUsageText } from 'calypso/components/backup-storage-space/hooks';

const GIGABYTE = 2 ** 30;
const TERABYTE = 2 ** 40;

function render( bytesUsed, bytesAvailable ) {
	const {
		result: { current: text },
	} = renderHook( () => useStorageUsageText( bytesUsed, bytesAvailable ) );

	return text;
}

describe( 'useStorageUsageText', () => {
	test.each( [
		[ GIGABYTE, 1.0 ],
		[ GIGABYTE * 5.49, 5.5 ],
		[ GIGABYTE * 0.91, 0.9 ],
		[ TERABYTE + 1, 1024.0 ],
	] )(
		'renders used storage in gigabytes to one decimal place, rounded',
		( bytesUsed, expectedGB ) => {
			const text = render( bytesUsed, 0 );
			expect( text.includes( `${ expectedGB.toFixed( 1 ) }GB` ) ).toBe( true );
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
			const text = render( 0, bytesAvailable );
			expect( text.includes( `${ expectedTB }TB` ) ).toBe( true );
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
			const text = render( 0, bytesAvailable );
			expect( text.includes( `${ expectedGB }GB` ) ).toBe( true );
		}
	);

	test( "doesn't render available storage if availableBytes is undefined", () => {
		const text = render( GIGABYTE, undefined );
		expect( text ).toEqual( '1.0GB used' );
	} );

	test( 'renders null if bytesUsed is undefined', () => {
		const text = render( undefined, GIGABYTE );
		expect( text ).toBeNull();
	} );
} );
