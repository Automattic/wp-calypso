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
import PluginPostPublishPanel from '../';

jest.mock( '../../../../../packages/components/src/button' );

describe( 'PluginPostPublishPanel', () => {
	test( 'renders fill properly', () => {
		const wrapper = mount(
			<SlotFillProvider>
				<PluginPostPublishPanel
					className="my-plugin-post-publish-panel"
					title="My panel title"
					initialOpen={ true }
				>
					My panel content
				</PluginPostPublishPanel>
				<PluginPostPublishPanel.Slot />
			</SlotFillProvider>
		);

		expect( wrapper.find( 'Slot' ).children() ).toMatchSnapshot();
	} );
} );
