/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { Panel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal Dependencies
 */
import PostStatus from '../post-status';
import PostExcerpt from '../post-excerpt';
import PostTaxonomies from '../post-taxonomies';
import FeaturedImage from '../featured-image';
import DiscussionPanel from '../discussion-panel';
import LastRevision from '../last-revision';
import PageAttributes from '../page-attributes';
import SettingsHeader from '../settings-header';
import Sidebar from '../';

const SIDEBAR_NAME = 'edit-post/document';

const DocumentSidebar = () => (
	<Sidebar
		name={ SIDEBAR_NAME }
		label={ __( 'Editor settings' ) }
	>
		<SettingsHeader sidebarName={ SIDEBAR_NAME } />
		<Panel>
			<PostStatus />
			<LastRevision />
			<PostTaxonomies />
			<FeaturedImage />
			<PostExcerpt />
			<DiscussionPanel />
			<PageAttributes />
		</Panel>
	</Sidebar>
);

export default DocumentSidebar;
