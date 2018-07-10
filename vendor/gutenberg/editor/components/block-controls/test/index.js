/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { BlockControls } from '../';

describe( 'BlockControls', () => {
	const controls = [
		{
			icon: 'editor-alignleft',
			title: 'Align left',
			align: 'left',
		},
		{
			icon: 'editor-aligncenter',
			title: 'Align center',
			align: 'center',
		},
		{
			icon: 'editor-alignright',
			title: 'Align right',
			align: 'right',
		},
	];

	// Skipped temporarily until Enzyme publishes new version that works with React 16.3.0 APIs.
	// eslint-disable-next-line jest/no-disabled-tests
	test.skip( 'Should render a dynamic toolbar of controls', () => {
		expect( shallow( <BlockControls controls={ controls } children={ <p>Child</p> } /> ) ).toMatchSnapshot();
	} );
} );
