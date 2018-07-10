/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { PostVisibilityCheck } from '../check';

describe( 'PostVisibilityCheck', () => {
	const render = ( { canEdit } ) => ( canEdit ? 'yes' : 'no' );

	it( 'should not render the edit link if the user doesn\'t have the right capability', () => {
		const wrapper = shallow( <PostVisibilityCheck hasPublishAction={ false } render={ render } /> );
		expect( wrapper.text() ).toBe( 'no' );
	} );

	it( 'should render if the user has the correct capability', () => {
		const wrapper = shallow( <PostVisibilityCheck hasPublishAction={ true } render={ render } /> );
		expect( wrapper.text() ).toBe( 'yes' );
	} );
} );
