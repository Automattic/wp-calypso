/**
 * External dependencies
 */
import { mount } from 'enzyme';

/**
 * WordPress dependencies
 */
import { SlotFillProvider } from '@wordpress/components';

/**
 * Internal dependencies
 */
import PluginPostStatusInfo from '../';

describe( 'PluginPostStatusInfo', () => {
	test( 'renders fill properly', () => {
		const wrapper = mount(
			<SlotFillProvider>
				<PluginPostStatusInfo
					className="my-plugin-post-status-info"
				>
					My plugin post status info
				</PluginPostStatusInfo>
				<PluginPostStatusInfo.Slot />
			</SlotFillProvider>
		);

		expect( wrapper.find( 'Slot' ).children() ).toMatchSnapshot();
	} );
} );
