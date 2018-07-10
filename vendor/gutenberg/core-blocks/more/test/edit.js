/**
 * External dependencies
 */
import { shallow } from 'enzyme';
/**
 * Internal dependencies
 */
import MoreEdit from '../edit';

const attributes = {
	customText: '',
	noTeaser: false,
};

describe( 'core/more/edit', () => {
	beforeEach( () => {
		attributes.noTeaser = false;
	} );
	test( 'should match snapshot when noTeaser is false', () => {
		const wrapper = shallow( <MoreEdit attributes={ attributes } /> );
		expect( wrapper ).toMatchSnapshot();
	} );
	test( 'should match snapshot when noTeaser is true', () => {
		attributes.noTeaser = true;
		const wrapper = shallow( <MoreEdit attributes={ attributes } /> );
		expect( wrapper ).toMatchSnapshot();
	} );
} );
