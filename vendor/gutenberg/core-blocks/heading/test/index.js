/**
 * Internal dependencies
 */
import { name, settings, getLevelFromHeadingNodeName } from '../';
import { blockEditRender } from '../../test/helpers';

describe( 'core/heading', () => {
	test( 'block edit matches snapshot', () => {
		const wrapper = blockEditRender( name, settings );

		expect( wrapper ).toMatchSnapshot();
	} );
} );

describe( 'getLevelFromHeadingNodeName()', () => {
	it( 'should return a numeric value from nodeName', () => {
		const level = getLevelFromHeadingNodeName( 'H4' );

		expect( level ).toBe( 4 );
	} );
} );
