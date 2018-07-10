/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { MultiBlocksSwitcher } from '../multi-blocks-switcher';

describe( 'MultiBlocksSwitcher', () => {
	test( 'should return null when the selection is not a multi block selection.', () => {
		const isMultiBlockSelection = false;
		const selectedBlockUids = [
			'an-uid',
		];
		const wrapper = shallow(
			<MultiBlocksSwitcher
				isMultiBlockSelection={ isMultiBlockSelection }
				selectedBlockUids={ selectedBlockUids }
			/>
		);

		expect( wrapper.html() ).toBeNull();
	} );

	test( 'should return a BlockSwitcher element matching the snapshot.', () => {
		const isMultiBlockSelection = true;
		const selectedBlockUids = [
			'an-uid',
			'another-uid',
		];
		const wrapper = shallow(
			<MultiBlocksSwitcher
				isMultiBlockSelection={ isMultiBlockSelection }
				selectedBlockUids={ selectedBlockUids }
			/>
		);

		expect( wrapper ).toMatchSnapshot();
	} );
} );
