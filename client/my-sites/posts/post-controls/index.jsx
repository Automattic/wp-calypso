/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import url from 'url';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'state/analytics/actions';
import {
	canCurrentUser,
	isPublicizeEnabled,
} from 'state/selectors';
import PostControl from './post-control';

export class PostControls extends Component {
	static propTypes = {
		canUserDeletePost: PropTypes.bool,
		canUserEditPost: PropTypes.bool,
		canUserPublishPost: PropTypes.bool,
		editURL: PropTypes.string.isRequired,
		fullWidth: PropTypes.bool,
		isPublicizeEnabled: PropTypes.bool,
		onDelete: PropTypes.func,
		onPublish: PropTypes.func,
		onRestore: PropTypes.func,
		onToggleShare: PropTypes.func,
		onTrash: PropTypes.func,
		post: PropTypes.object.isRequired,
		recordCopyPost: PropTypes.func,
		recordEditPost: PropTypes.func,
		recordPreviewPost: PropTypes.func,
		recordViewPost: PropTypes.func,
		recordViewPostStats: PropTypes.func,
		site: PropTypes.object,
		translate: PropTypes.func,
	};

	state = {
		showMoreOptions: false,
	};

	onShowMore = () => this.setState( { showMoreOptions: true } );

	onHideMore = () => this.setState( { showMoreOptions: false } );

	getAvailableControls() {
		const {
			canUserDeletePost,
			canUserEditPost,
			canUserPublishPost,
			editURL,
			fullWidth,
			onDelete,
			onPublish,
			onRestore,
			onToggleShare,
			onTrash,
			post,
			recordCopyPost,
			recordEditPost,
			recordPreviewPost,
			recordViewPost,
			recordViewPostStats,
			site,
			translate,
		} = this.props;
		const controls = { main: [], more: [] };

		// NOTE: Currently Jetpack site posts are not returning `post.capabilities`
		// and those posts will not have access to post management type controls

		// Main Controls (not behind ... more link)
		if ( canUserEditPost ) {
			controls.main.push( {
				className: 'edit',
				href: editURL,
				icon: 'pencil',
				onClick: recordEditPost,
				text: translate( 'Edit' ),
			} );
		}

		if ( 'publish' === post.status ) {
			controls.main.push( {
				className: 'view',
				href: post.URL,
				icon: 'external',
				onClick: recordViewPost,
				target: '_blank',
				text: translate( 'View' ),
			} );

			controls.main.push( {
				className: 'stats',
				href: `/stats/post/${ post.ID }/${ site.slug }`,
				icon: 'stats-alt',
				onClick: recordViewPostStats,
				text: translate( 'Stats' ),
			} );

			if ( isEnabled( 'republicize' ) ) {
				controls.main.push( {
					className: 'share',
					disabled: ! this.props.isPublicizeEnabled,
					icon: 'share',
					onClick: onToggleShare,
					text: translate( 'Share' ),
				} );
			}
		} else if ( 'trash' !== post.status ) {
			const parsedUrl = url.parse( post.URL, true );
			parsedUrl.query.preview = true;
			// NOTE: search needs to be cleared in order to rebuild query
			// http://nodejs.org/api/url.html#url_url_format_urlobj
			parsedUrl.search = '';

			controls.main.push( {
				className: 'view',
				href: url.format( parsedUrl ),
				icon: 'external',
				onClick: recordPreviewPost,
				text: translate( 'Preview' ),
			} );

			if ( canUserPublishPost ) {
				controls.main.push( {
					className: 'publish',
					icon: 'reader',
					onClick: onPublish,
					text: translate( 'Publish' ),
				} );
			}
		} else if ( canUserDeletePost ) {
			controls.main.push( {
				className: 'restore',
				icon: 'undo',
				onClick: onRestore,
				text: translate( 'Restore' ),
			} );
		}

		if ( canUserDeletePost ) {
			if ( 'trash' === post.status ) {
				controls.main.push( {
					className: 'trash is-scary',
					icon: 'trash',
					onClick: onDelete,
					text: translate( 'Delete Permanently' ),
				} );
			} else {
				controls.main.push( {
					className: 'trash',
					icon: 'trash',
					onClick: onTrash,
					text: translate( 'Trash' ),
				} );
			}
		}

		if ( ( 'publish' === post.status || 'private' === post.status ) && canUserEditPost ) {
			controls.main.push( {
				className: 'copy',
				href: `/post/${ site.slug }?copy=${ post.ID }`,
				icon: 'clipboard',
				onClick: recordCopyPost,
				text: translate( 'Copy' ),
			} );
		}

		// More Controls (behind ... more link)
		if ( controls.main.length > 4 && fullWidth ) {
			controls.more = controls.main.splice( 4 );
		} else if ( controls.main.length > 2 && ! fullWidth ) {
			controls.more = controls.main.splice( 2 );
		}

		if ( controls.more.length ) {
			controls.main.push( {
				className: 'more',
				icon: 'ellipsis',
				onClick: this.onShowMore,
				text: translate( 'More' ),
			} );

			controls.more.push( {
				className: 'back',
				icon: 'chevron-left',
				onClick: this.onHideMore,
				text: translate( 'Back' ),
			} );
		}

		return controls;
	}

	render() {
		const { main, more } = this.getAvailableControls();
		const classes = classNames( 'post-controls', {
			'show-more-options': this.state.showMoreOptions,
			'post-controls--desk-nomore': more <= 2,
		} );

		return (
			<div className={ classes }>
				<ul className="post-controls__pane post-controls__more-options">
					{ more.map( ( control, index ) =>
						<PostControl { ...control } key={ index } />
					) }
				</ul>
				<ul className="post-controls__pane post-controls__main-options">
					{ main.map( ( control, index ) =>
						<PostControl { ...control } key={ index } />
					) }
				</ul>
			</div>
		);
	}
}

const mapStateToProps = ( state, { site, post } ) => ( {
	canUserDeletePost: canCurrentUser( state, site.ID, 'delete_posts' ),
	canUserEditPost: canCurrentUser( state, site.ID, 'edit_posts' ),
	canUserPublishPost: canCurrentUser( state, site.ID, 'publish_posts' ),
	isPublicizeEnabled: isPublicizeEnabled( state, site.ID, post.type ),
} );

const mapDispatchToProps = {
	recordCopyPost: () => composeAnalytics(
		recordGoogleEvent( 'Posts', 'Clicked Copy Post' ),
		recordTracksEvent( 'calypso_post_controls_copy_post_click' ),
	),
	recordEditPost: () => composeAnalytics(
		recordGoogleEvent( 'Posts', 'Clicked Edit Post' ),
		recordTracksEvent( 'calypso_post_controls_edit_post_click' ),
	),
	recordPreviewPost: () => composeAnalytics(
		recordGoogleEvent( 'Posts', 'Clicked Preview Post' ),
		recordTracksEvent( 'calypso_post_controls_preview_post_click' ),
	),
	recordViewPost: () => composeAnalytics(
		recordGoogleEvent( 'Posts', 'Clicked View Post' ),
		recordTracksEvent( 'calypso_post_controls_view_post_click' ),
	),
	recordViewPostStats: () => composeAnalytics(
		recordGoogleEvent( 'Posts', 'Clicked View Post Stats' ),
		recordTracksEvent( 'calypso_post_controls_view_post_stats_click' ),
	),
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( PostControls ) );
