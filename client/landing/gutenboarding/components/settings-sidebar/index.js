/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import React from 'react';
import { BlockInspector } from '@wordpress/block-editor';
import { Panel, PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Sidebar from '../sidebar';

/* eslint-disable wpcalypso/jsx-classname-namespace */

export default function SettingsSidebar( { isActive } ) {
	return (
		<Sidebar
			label={ NO__( 'Site block settings' ) }
			className="gutenboarding__settings-sidebar"
			isActive={ isActive }
		>
			<Panel>
				<PanelBody className="edit-post-settings-sidebar__panel-block">
					<BlockInspector />
				</PanelBody>
			</Panel>
		</Sidebar>
	);
}
