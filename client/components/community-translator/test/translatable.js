/**
 * @jest-environment jsdom
 */

import { shallow } from 'enzyme';
import { Translatable } from '../translatable';

const defaultProps = {
	singular: 'Original translation',
	locale: 'it',
	plural: 'Original translations',
};

describe( '<Translatable />', () => {
	test( 'should render', () => {
		const wrapper = shallow( <Translatable { ...defaultProps } /> );
		expect( wrapper ).toMatchSnapshot();
	} );
} );
