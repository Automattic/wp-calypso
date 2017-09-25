/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import utils from 'lib/posts/utils';
import { getPostTypes } from 'state/post-types/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class EditorConfirmationSidebarHeader extends PureComponent {
	static propTypes = {
		post: PropTypes.object,
	};

	renderPublishHeader() {
		const { post, postTypeLabel, translate } = this.props;
		const postType = get( post, 'type', 'post' );

		switch ( postType ) {
			case 'post':
				return (
					<div className="editor-confirmation-sidebar__header">
						{
							translate( '{{strong}}Almost there!{{/strong}} ' +
								'You can double-check your post’s settings below. When you’re happy, ' +
								'use the big green button to send your post out into the world!', {
									comment: 'This string appears as the header for the confirmation sidebar ' +
									'when a user publishes a post.',
									components: {
										strong: <strong />
									},
								} )
						}
					</div>
				);
			case 'page':
				return (
					<div className="editor-confirmation-sidebar__header">
						{
							translate( '{{strong}}Almost there!{{/strong}} ' +
								'You can double-check your page’s settings below. When you’re happy, ' +
								'use the big green button to send your page out into the world!', {
									comment: 'This string appears as the header for the confirmation sidebar ' +
									'when a user publishes a page.',
									components: {
										strong: <strong />
									},
								} )
						}
					</div>
				);
			default:
				return (
					<div className="editor-confirmation-sidebar__header">
						{
							translate( '{{strong}}Almost there!{{/strong}} ' +
								'You can double-check your settings below. When you’re happy, ' +
								'use the big green button to send your %(postTypeLabel)s out into the world!', {
									comment: 'This string appears as the header for the confirmation sidebar ' +
									'when a user publishes a custom post type. `postTypeLabel` is the singular ' +
									'name of the custom post type.',
									args: {
										postTypeLabel
									},
									components: {
										strong: <strong />
									},
								} )
						}
					</div>
				);
		}
	}

	renderScheduleHeader() {
		const { post, postTypeLabel, translate } = this.props;
		const postType = get( post, 'type', 'post' );

		switch ( postType ) {
			case 'post':
				return (
					<div className="editor-confirmation-sidebar__header">
						{
							translate( '{{strong}}Almost there!{{/strong}} ' +
								'You can double-check your post’s settings below. When you’re happy, ' +
								'use the big green button to schedule your post!', {
									comment: 'This string appears as the header for the confirmation sidebar ' +
									'when a user schedules the publishing of a post.',
									components: {
										strong: <strong />
									},
								} )
						}
					</div>
				);
			case 'page':
				return (
					<div className="editor-confirmation-sidebar__header">
						{
							translate( '{{strong}}Almost there!{{/strong}} ' +
								'You can double-check your page’s settings below. When you’re happy, ' +
								'use the big green button to schedule your page!', {
									comment: 'This string appears as the header for the confirmation sidebar ' +
									'when a user schedules the publishing of a page.',
									components: {
										strong: <strong />
									},
								} )
						}
					</div>
				);
			default:
				return (
					<div className="editor-confirmation-sidebar__header">
						{
							translate( '{{strong}}Almost there!{{/strong}} ' +
								'You can double-check your settings below. When you’re happy, ' +
								'use the big green button to schedule your %(postTypeLabel)s!', {
									comment: 'This string appears as the header for the confirmation sidebar ' +
									'when a user schedules a custom post type. `postTypeLabel` is the singular ' +
									'name of the custom post type.',
									args: {
										postTypeLabel
									},
									components: {
										strong: <strong />
									},
								} )
						}
					</div>
				);
		}
	}

	render() {
		const isScheduled = utils.isFutureDated( this.props.post );

		if ( isScheduled ) {
			return this.renderScheduleHeader();
		}

		return this.renderPublishHeader();
	}
}

export default connect( ( state, { post } ) => {
	const siteId = getSelectedSiteId( state );
	const postTypes = getPostTypes( state, siteId );
	const postTypeLabel = post && postTypes &&
		postTypes[ post.type ] && get( postTypes[ post.type ], 'labels.singular_name' );

	return {
		postTypeLabel,
	};
} )( localize( EditorConfirmationSidebarHeader ) );
