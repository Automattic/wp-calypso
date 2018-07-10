/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { BlockRemoveButton } from '../block-remove-button';

describe( 'BlockRemoveButton', () => {
	it( 'matches the snapshot', () => {
		const wrapper = shallow(
			<BlockRemoveButton
				role="menuitem"
				onRemove={ noop }
			/>
		);

		expect( wrapper ).toMatchSnapshot();
	} );

	it( 'calls the onClick function when the IconButton is clicked', () => {
		const onClick = jest.fn();
		const wrapper = shallow(
			<BlockRemoveButton
				role="menuitem"
				onRemove={ noop }
				onClick={ onClick }
			/>
		);
		wrapper.find( 'IconButton' ).first().simulate( 'click' );

		expect( onClick ).toHaveBeenCalled();
	} );
} );
