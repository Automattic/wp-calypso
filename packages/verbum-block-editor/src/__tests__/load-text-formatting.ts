import { select } from '@wordpress/data';
import { store as richTextStore } from '@wordpress/rich-text';
import { loadTextFormatting } from '../load-text-formatting';

describe( 'loadTextFormatting', () => {
	it( 'leaves only bold, italic and link registered', () => {
		loadTextFormatting();

		const names = select( richTextStore )
			.getFormatTypes()
			.map( ( { name } ) => name );
		expect( names.sort() ).toEqual( [ 'core/bold', 'core/italic', 'core/link' ] );
	} );
} );
