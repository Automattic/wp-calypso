/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { includes, noop } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { ga } from 'lib/analytics';
import { userCan } from 'lib/posts/utils';
import { isPublicizeEnabled } from 'state/selectors';
import { getSiteSlug, isSitePreviewable } from 'state/sites/selectors';

const edit = () => ga.recordEvent( 'Posts', 'Clicked Edit Post' );
const copy = () => ga.recordEvent( 'Posts', 'Clicked Copy Post' );
const viewStats = () => ga.recordEvent( 'Posts', 'Clicked View Post Stats' );

const getAvailableControls = props => {
	const {
		current,
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
		siteSlug,
		translate,
		onViewPost,
	} = props;
	const controls = { main: [], more: [] };

	// NOTE: Currently Jetpack site posts are not returning `post.capabilities`
	// and those posts will not have access to post management type controls

	// Main Controls (not behind ... more link)
	if ( userCan( 'edit_post', post ) ) {
		controls.main.push( {
			className: 'edit' + ( current === 'edit' ? ' is-active' : '' ),
			href: editURL,
			icon: 'pencil',
			onClick: edit,
			text: translate( 'Edit' ),
		} );
	}

	if ( 'publish' === post.status ) {
		controls.main.push( {
			className: 'view' + ( current === 'view' ? ' is-active' : '' ),
			href: post.URL,
			icon: props.isPreviewable ? 'visible' : 'external',
			onClick: onViewPost,
			text: translate( 'View' ),
		} );

		controls.main.push( {
			className: 'stats' + ( current === 'stats' ? ' is-active' : '' ),
			href: `/stats/post/${ post.ID }/${ siteSlug }`,
			icon: 'stats-alt',
			onClick: viewStats,
			text: translate( 'Stats' ),
		} );

		if ( isEnabled( 'republicize' ) ) {
			controls.main.push( {
				className: 'share' + ( current === 'share' ? ' is-active' : '' ),
				disabled: ! props.isPublicizeEnabled,
				icon: 'share',
				onClick: onToggleShare,
				text: translate( 'Share' ),
			} );
		}
	} else if ( 'trash' !== post.status ) {
		controls.main.push( {
			className: 'view' + ( current === 'preview' ? ' is-active' : '' ),
			icon: props.isPreviewable ? 'visible' : 'external',
			onClick: onViewPost,
			text: translate( 'Preview' ),
		} );

		if ( userCan( 'publish_post', post ) ) {
			controls.main.push( {
				className: 'publish' + ( current === 'publish' ? ' is-active' : '' ),
				icon: 'reader',
				onClick: onPublish,
				text: translate( 'Publish' ),
			} );
		}
	} else if ( userCan( 'delete_post', post ) ) {
		controls.main.push( {
			className: 'restore' + ( current === 'restore' ? ' is-active' : '' ),
			icon: 'undo',
			onClick: onRestore,
			text: translate( 'Restore' ),
		} );
	}

	if ( userCan( 'delete_post', post ) ) {
		if ( 'trash' === post.status ) {
			controls.main.push( {
				className: 'trash is-scary' + ( current === 'delete-permanently' ? ' is-active' : '' ),
				icon: 'trash',
				onClick: onDelete,
				text: translate( 'Delete Permanently' ),
			} );
		} else {
			controls.main.push( {
				className: 'trash' + ( current === 'trash' ? ' is-active' : '' ),
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
			className: 'copy' + ( current === 'copy' ? ' is-active' : '' ),
			href: `/post/${ siteSlug }?copy=${ post.ID }`,
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
			className: 'more' + ( current === 'more' ? ' is-active' : '' ),
			icon: 'ellipsis',
			onClick: onShowMore,
			text: translate( 'More' ),
		} );

		controls.more.push( {
			className: 'back' + ( current === 'back' ? ' is-active' : '' ),
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
	current: PropTypes.string,
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
	siteId: PropTypes.number,
	translate: PropTypes.func,
};

export default connect( ( state, { siteId, post } ) => ( {
	isPreviewable: false !== isSitePreviewable( state, siteId ),
	isPublicizeEnabled: isPublicizeEnabled( state, siteId, post.type ),
	siteSlug: getSiteSlug( state, siteId ),
} ) )( localize( PostControls ) );
