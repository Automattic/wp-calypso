/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import { recordEvent } from 'lib/posts/stats';
import postUtils from 'lib/posts/utils';
import siteUtils from 'lib/site/utils';
import Button from 'components/button';

export const getPublishButtonStatus = ( site, post, savedPost ) => {
	if (
		postUtils.isPublished( savedPost ) &&
		! postUtils.isBackDatedPublished( savedPost ) &&
		! postUtils.isFutureDated( post ) ||
		(
			savedPost &&
			savedPost.status === 'future' &&
			postUtils.isFutureDated( post )
		)
	) {
		return 'update';
	}

	if ( postUtils.isFutureDated( post ) ) {
		return 'schedule';
	}

	if ( siteUtils.userCan( 'publish_posts', site ) ) {
		return 'publish';
	}

	if ( savedPost && savedPost.status === 'pending' ) {
		return 'update';
	}

	return 'requestReview';
};

export default React.createClass( {
	displayName: 'EditorPublishButton',

	propTypes: {
		site: PropTypes.object,
		post: PropTypes.object,
		savedPost: PropTypes.object,
		onSave: PropTypes.func,
		onPublish: PropTypes.func,
		tabIndex: PropTypes.number,
		isPublishing: PropTypes.bool,
		isSaveBlocked: PropTypes.bool,
		hasContent: PropTypes.bool,
		needsVerification: PropTypes.bool
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
		const buttonState = getPublishButtonStatus( this.props.site, this.props.post, this.props.savedPost );
		const eventString = postUtils.isPage( this.props.post ) ? pageEvents[ buttonState ] : postEvents[ buttonState ];
		recordEvent( eventString );
		recordEvent( 'Clicked Primary Button' );
	},

	getButtonLabel: function() {
		switch ( getPublishButtonStatus( this.props.site, this.props.post, this.props.savedPost ) ) {
			case 'update':
				return this.translate( 'Update' );
			case 'schedule':
				return this.translate( 'Schedule' );
			case 'publish':
				return this.translate( 'Publish' );
			case 'requestReview':
				return this.translate( 'Submit for Review' );
		}
	},

	onClick: function() {
		this.trackClick();

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
			this.props.hasContent &&
			! this.props.needsVerification;
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
