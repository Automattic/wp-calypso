/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import stats from 'lib/posts/stats';
import postUtils from 'lib/posts/utils';
import siteUtils from 'lib/site/utils';
import Button from 'components/button';

export const EditorPublishButton = React.createClass( {
	propTypes: {
		site: PropTypes.object,
		post: PropTypes.object,
		savedPost: PropTypes.object,
		onSave: PropTypes.func,
		onPublish: PropTypes.func,
		tabIndex: PropTypes.number,
		isPublishing: PropTypes.bool,
		isSaveBlocked: PropTypes.bool,
		hasContent: PropTypes.bool
	},

	trackClick: function() {
		const postEvents = {
			update: 'Clicked Update Post Button',
			schedule: 'Clicked Schedule Post Button',
			requestReview: 'Clicked Request-Review Post Button',
			publish: 'Clicked Publish Post Button'
		};
		const pageEvents = {
			update: 'Clicked Update Page Button',
			schedule: 'Clicked Schedule Page Button',
			requestReview: 'Clicked Request-Review Page Button',
			publish: 'Clicked Publish Page Button'
		};
		const buttonState = this.getButtonState();
		const eventString = postUtils.isPage( this.props.post ) ? pageEvents[ buttonState ] : postEvents[ buttonState ];
		stats.recordEvent( eventString );
		stats.recordEvent( 'Clicked Primary Button' );
	},

	getButtonState: function() {
		if (
			postUtils.isPublished( this.props.savedPost ) &&
			! postUtils.isBackDatedPublished( this.props.savedPost ) &&
			! postUtils.isFutureDated( this.props.post ) ||
			(
				this.props.savedPost &&
				this.props.savedPost.status === 'future' &&
				postUtils.isFutureDated( this.props.post )
			)
		) {
			return 'update';
		}

		if ( postUtils.isFutureDated( this.props.post ) ) {
			return 'schedule';
		}

		if ( siteUtils.userCan( 'publish_posts', this.props.site ) ) {
			return 'publish';
		}

		if ( this.props.savedPost && this.props.savedPost.status === 'pending' ) {
			return 'update';
		}

		return 'requestReview';
	},

	getButtonLabel: function() {
		switch ( this.getButtonState() ) {
			case 'update':
				return this.props.translate( 'Update' );
			case 'schedule':
				return this.props.translate( 'Schedule' );
			case 'publish':
				return this.props.translate( 'Publish' );
			case 'requestReview':
				return this.props.translate( 'Submit for Review' );
		}
	},

	onClick: function() {
		if ( postUtils.isFutureDated( this.props.post ) ) {
			return this.props.onSave( 'future' );
		}

		if ( postUtils.isPublished( this.props.savedPost ) &&
			! postUtils.isBackDatedPublished( this.props.savedPost )
		) {
			return this.props.onSave();
		}

		if ( siteUtils.userCan( 'publish_posts', this.props.site ) ) {
			return this.props.onPublish();
		}

		return this.props.onSave( 'pending' );
	},

	isEnabled: function() {
		return ! this.props.isPublishing &&
			! this.props.isSaveBlocked &&
			this.props.hasContent;
	},

	render: function() {
		return (
			<Button
				className="editor-publish-button"
				primary={ true }
				onClick={ this.onClick }
				disabled={ ! this.isEnabled() }
				tabIndex={ this.props.tabIndex }
			>
				{ this.getButtonLabel() }
			</Button>
		);
	}
} );

export default localize( EditorPublishButton );
