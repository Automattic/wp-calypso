import { kebabCase } from '../kebab-case';

it.each( [
	[ 'smallFeature', 'small-feature' ],
	[ 'spaceAround', 'space-around' ],
	[ 'contain', 'contain' ],
] )( 'turns %p into %p', ( value, expected ) => {
	expect( kebabCase( value ) ).toBe( expected );
} );
