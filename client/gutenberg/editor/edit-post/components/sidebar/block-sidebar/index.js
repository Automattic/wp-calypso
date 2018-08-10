/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { Panel, PanelBody } from '@wordpress/components';
import { BlockInspector } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal Dependencies
 */
import SettingsHeader from '../settings-header';
import Sidebar from '../';

const SIDEBAR_NAME = 'edit-post/block';

/* eslint-disable wpcalypso/jsx-classname-namespace */
const BlockSidebar = () => (
	<Sidebar
		name={ SIDEBAR_NAME }
		label={ __( 'Editor settings' ) }
	>
		<SettingsHeader sidebarName={ SIDEBAR_NAME } />
		<Panel>
			<PanelBody className="edit-post-block-sidebar__panel">
				<BlockInspector />
			</PanelBody>
		</Panel>
	</Sidebar>
);
/* eslint-enable wpcalypso/jsx-classname-namespace */

export default BlockSidebar;
