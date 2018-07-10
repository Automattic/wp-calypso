/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { SharedBlockDeleteButton } from '../shared-block-delete-button';

describe( 'SharedBlockDeleteButton', () => {
	it( 'matches the snapshot', () => {
		const wrapper = shallow(
			<SharedBlockDeleteButton
				role="menuitem"
				sharedBlock={ { id: 123 } }
				onDelete={ noop }
			/>
		);

		expect( wrapper ).toMatchSnapshot();
	} );

	it( 'should allow deleting a shared block', () => {
		const onDelete = jest.fn();
		const wrapper = shallow(
			<SharedBlockDeleteButton
				sharedBlock={ { id: 123 } }
				onDelete={ onDelete }
			/>
		);

		wrapper.find( 'IconButton' ).simulate( 'click' );
		expect( onDelete ).toHaveBeenCalledWith( 123 );
	} );
} );
