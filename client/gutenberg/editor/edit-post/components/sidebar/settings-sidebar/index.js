/** @format */
/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { Panel, PanelBody } from '@wordpress/components';
import { compose, ifCondition } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { BlockInspector } from '@wordpress/editor';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
/**
 * Internal Dependencies
 */
import Sidebar from '../';
import SettingsHeader from '../settings-header';
import PostStatus from '../post-status';
import LastRevision from 'gutenberg/editor/components/sidebar/last-revision'; // GUTENLYPSO
import PostTaxonomies from '../post-taxonomies';
import FeaturedImage from '../featured-image';
import PostExcerpt from '../post-excerpt';
import PostLink from '../post-link';
import DiscussionPanel from '../discussion-panel';
import PageAttributes from '../page-attributes';
import MetaBoxes from '../../meta-boxes';

const SettingsSidebar = ( { sidebarName } ) => (
	<Sidebar name={ sidebarName } label={ __( 'Editor settings' ) }>
		<SettingsHeader sidebarName={ sidebarName } />
		<Panel>
			{ sidebarName === 'edit-post/document' && (
				<Fragment>
					<PostStatus />
					<LastRevision />
					<PostLink />
					<PostTaxonomies />
					<FeaturedImage />
					<PostExcerpt />
					<DiscussionPanel />
					<PageAttributes />
					<MetaBoxes location="side" />
				</Fragment>
			) }
			{ sidebarName === 'edit-post/block' && (
				<PanelBody className="edit-post-settings-sidebar__panel-block">
					<BlockInspector />
				</PanelBody>
			) }
		</Panel>
	</Sidebar>
);

export default compose(
	withSelect( select => {
		const { getActiveGeneralSidebarName, isEditorSidebarOpened } = select( 'core/edit-post' );

		return {
			isEditorSidebarOpened: isEditorSidebarOpened(),
			sidebarName: getActiveGeneralSidebarName(),
		};
	} ),
	ifCondition( ( { isEditorSidebarOpened } ) => isEditorSidebarOpened )
)( SettingsSidebar );
