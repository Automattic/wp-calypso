/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { PostScheduleCheck } from '../check';

describe( 'PostScheduleCheck', () => {
	it( 'should not render anything if the user doesn\'t have the right capabilities', () => {
		const wrapper = shallow( <PostScheduleCheck hasPublishAction={ false } >yes</PostScheduleCheck> );
		expect( wrapper.type() ).toBe( null );
	} );

	it( 'should render if the user has the correct capability', () => {
		const wrapper = shallow( <PostScheduleCheck hasPublishAction={ true }>yes</PostScheduleCheck> );
		expect( wrapper.type() ).not.toBe( null );
	} );
} );
