/**
 * WordPress dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { BlockInspector } from '@wordpress/block-editor';
import { Panel, PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Sidebar from '../sidebar';

import './style.scss';

/*
 * Relevant Gutenberg styles:
 * @wordpress/edit-post/src/components/sidebar/settings-sidebar/style.scss
 * .edit-post-settings-sidebar__panel-block
 */

 /* eslint-disable no-restricted-syntax */
import '@wordpress/edit-post/build-style/style.css';
/* eslint-enable no-restricted-syntax */

export default function SettingsSidebar( { isActive } ) {
	return (
		<Sidebar
			label={ 'SiteBlock Settings' }
			className={ 'gutenboarding__settings-sidebar' }
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
