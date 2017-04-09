/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { includes, noop } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { ga } from 'lib/analytics';
import { userCan } from 'lib/posts/utils';
import { isPublicizeEnabled } from 'state/selectors';
import { isSitePreviewable } from 'state/sites/selectors';

const edit = () => ga.recordEvent( 'Posts', 'Clicked Edit Post' );
const copy = () => ga.recordEvent( 'Posts', 'Clicked Copy Post' );
const viewStats = () => ga.recordEvent( 'Posts', 'Clicked View Post Stats' );

const getAvailableControls = props => {
	const {
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
		onViewPost,
	} = props;
	const controls = { main: [], more: [] };

	// NOTE: Currently Jetpack site posts are not returning `post.capabilities`
	// and those posts will not have access to post management type controls

	// Main Controls (not behind ... more link)
	if ( userCan( 'edit_post', post ) ) {
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
			icon: props.isPreviewable ? 'visible' : 'external',
			onClick: onViewPost,
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
		controls.main.push( {
			className: 'view',
			icon: props.isPreviewable ? 'visible' : 'external',
			onClick: onViewPost,
			text: translate( 'Preview' ),
		} );

		if ( userCan( 'publish_post', post ) ) {
			controls.main.push( {
				className: 'publish',
				icon: 'reader',
				onClick: onPublish,
				text: translate( 'Publish' ),
			} );
		}
	} else if ( userCan( 'delete_post', post ) ) {
		controls.main.push( {
			className: 'restore',
			icon: 'undo',
			onClick: onRestore,
			text: translate( 'Restore' ),
		} );
	}

	if ( userCan( 'delete_post', post ) ) {
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

	if (
		includes( [ 'draft', 'future', 'pending', 'private', 'publish' ], post.status ) &&
		userCan( 'edit_post', post )
	) {
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

const getControlElements = controls => controls.map( ( control, index ) =>
	<li
		className={ classNames( { 'post-controls__disabled': control.disabled } ) }
		key={ index }
	>
		<a
			className={ `post-controls__${ control.className }` }
			href={ control.href }
			onClick={ control.disabled ? noop : control.onClick }
			target={ control.target ? control.target : null }
		>
			<Gridicon icon={ control.icon } size={ 18 } />
			<span>
				{ control.text }
			</span>
		</a>
	</li>
);

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
					{ getControlElements( more ) }
				</ul>
			}
			<ul className="posts__post-controls post-controls__pane post-controls__main-options">
				{ getControlElements( main ) }
			</ul>
		</div>
	);
};

PostControls.propTypes = {
	editURL: PropTypes.string.isRequired,
	fullWidth: PropTypes.bool,
	isPublicizeEnabled: PropTypes.bool,
	isPreviewable: PropTypes.bool,
	onDelete: PropTypes.func,
	onHideMore: PropTypes.func.isRequired,
	onPublish: PropTypes.func,
	onRestore: PropTypes.func,
	onShowMore: PropTypes.func.isRequired,
	onToggleShare: PropTypes.func,
	onTrash: PropTypes.func,
	onViewPost: PropTypes.func,
	post: PropTypes.object.isRequired,
	site: PropTypes.object,
	translate: PropTypes.func,
};

export default connect( ( state, { site, post } ) => ( {
	isPreviewable: false !== isSitePreviewable( state, site.ID ),
	isPublicizeEnabled: isPublicizeEnabled( state, site.ID, post.type ),
} ) )( localize( PostControls ) );
