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
import PluginPrePublishPanel from '../';

describe( 'PluginPrePublishPanel', () => {
	test( 'renders fill properly', () => {
		const wrapper = mount(
			<SlotFillProvider>
				<PluginPrePublishPanel
					className="my-plugin-pre-publish-panel"
					title="My panel title"
					initialOpen={ true }
				>
					My panel content
				</PluginPrePublishPanel>
				<PluginPrePublishPanel.Slot />
			</SlotFillProvider>
		);

		expect( wrapper.find( 'Slot' ).children() ).toMatchSnapshot();
	} );
} );
