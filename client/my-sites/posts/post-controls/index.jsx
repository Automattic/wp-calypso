/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import url from 'url';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { ga } from 'lib/analytics';
import {
	canCurrentUser,
	isPublicizeEnabled,
} from 'state/selectors';
import PostControl from './post-control';

const view = () => ga.recordEvent( 'Posts', 'Clicked View Post' );
const preview = () => ga.recordEvent( 'Posts', 'Clicked Preiew Post' );
const edit = () => ga.recordEvent( 'Posts', 'Clicked Edit Post' );
const copy = () => ga.recordEvent( 'Posts', 'Clicked Copy Post' );
const viewStats = () => ga.recordEvent( 'Posts', 'Clicked View Post Stats' );

const getAvailableControls = props => {
	const {
		canUserDeletePost,
		canUserEditPost,
		canUserPublishPost,
		editURL,
		fullWidth,
		onDelete,
		onHideMore,
		onPublish,
		onRestore,
		onShowMore,
		onToggleShare,
		onTrash,
		post,
		site,
		translate,
	} = props;
	const controls = { main: [], more: [] };

	// NOTE: Currently Jetpack site posts are not returning `post.capabilities`
	// and those posts will not have access to post management type controls

	// Main Controls (not behind ... more link)
	if ( canUserEditPost ) {
		controls.main.push( {
			className: 'edit',
			href: editURL,
			icon: 'pencil',
			onClick: edit,
			text: translate( 'Edit' ),
		} );
	}

	if ( 'publish' === post.status ) {
		controls.main.push( {
			className: 'view',
			href: post.URL,
			icon: 'external',
			onClick: view,
			target: '_blank',
			text: translate( 'View' ),
		} );

		controls.main.push( {
			className: 'stats',
			href: `/stats/post/${ post.ID }/${ site.slug }`,
			icon: 'stats-alt',
			onClick: viewStats,
			text: translate( 'Stats' ),
		} );

		if ( isEnabled( 'republicize' ) ) {
			controls.main.push( {
				className: 'share',
				disabled: ! props.isPublicizeEnabled,
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
			onClick: preview,
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
			onClick: copy,
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
			onClick: onShowMore,
			text: translate( 'More' ),
		} );

		controls.more.push( {
			className: 'back',
			icon: 'chevron-left',
			onClick: onHideMore,
			text: translate( 'Back' ),
		} );
	}

	return controls;
};

export const PostControls = props => {
	const { main, more } = getAvailableControls( props );
	const classes = classNames(
		'post-controls',
		{ 'post-controls--desk-nomore': more <= 2 }
	);

	return (
		<div className={ classes }>
			{ more.length > 0 &&
				<ul className="posts__post-controls post-controls__pane post-controls__more-options">
					{ more.map( ( control, index ) =>
						<PostControl control={ control } key={ index } />
					) }
				</ul>
			}
			<ul className="posts__post-controls post-controls__pane post-controls__main-options">
				{ main.map( ( control, index ) =>
					<PostControl control={ control } key={ index } />
				) }
			</ul>
		</div>
	);
};

PostControls.propTypes = {
	canUserDeletePost: PropTypes.bool,
	canUserEditPost: PropTypes.bool,
	canUserPublishPost: PropTypes.bool,
	editURL: PropTypes.string.isRequired,
	fullWidth: PropTypes.bool,
	isPublicizeEnabled: PropTypes.bool,
	onDelete: PropTypes.func,
	onHideMore: PropTypes.func.isRequired,
	onPublish: PropTypes.func,
	onRestore: PropTypes.func,
	onShowMore: PropTypes.func.isRequired,
	onToggleShare: PropTypes.func,
	onTrash: PropTypes.func,
	post: PropTypes.object.isRequired,
	site: PropTypes.object,
	translate: PropTypes.func,
};

export default connect( ( state, { site, post } ) => ( {
	canUserDeletePost: canCurrentUser( state, site.ID, 'delete_post' ),
	canUserEditPost: canCurrentUser( state, site.ID, 'edit_post' ),
	canUserPublishPost: canCurrentUser( state, site.ID, 'publish_post' ),
	isPublicizeEnabled: isPublicizeEnabled( state, site.ID, post.type ),
} ) )( localize( PostControls ) );
