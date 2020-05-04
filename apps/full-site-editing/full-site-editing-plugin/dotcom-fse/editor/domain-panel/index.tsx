/**
 * External dependencies
 */
import { PluginPrePublishPanel } from '@wordpress/edit-post';
import { registerPlugin } from '@wordpress/plugins';
import { Modal } from '@wordpress/components';

/**
 * Internal dependencies
 */
import DomainPicker from './domain-picker';

import '../../../../../../client/landing/gutenboarding/components/domain-picker/style.scss';
import '../../../../../../client/landing/gutenboarding/components/domain-picker-button/style.scss';
import '../../../../../../client/landing/gutenboarding/components/domain-picker-modal/style.scss';
import '../../../../../../client/landing/gutenboarding/components/domain-picker-popover/style.scss';
import '../../../../../../client/landing/gutenboarding/components/domain-categories/style.scss';

const PLUGIN_SIDEBAR_NAME = 'a8c-domain-sidebar';

registerPlugin( PLUGIN_SIDEBAR_NAME, {
	render: () => (
		<>
			<PluginPrePublishPanel id={ PLUGIN_SIDEBAR_NAME }>
				<Modal shouldCloseOnClickOutside>
					<DomainPicker />
				</Modal>
			</PluginPrePublishPanel>
		</>
	),
} );
