/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { includes, noop } from 'lodash';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Count from 'components/count';
import { isEnabled } from 'config';
import { ga } from 'lib/analytics';
import QuerySharePostActions from 'components/data/query-share-post-actions';
import { SCHEDULED } from 'blocks/post-share/constants';
import { userCan } from 'lib/posts/utils';
import {
	getPostShareScheduledActions,
	isPublicizeEnabled
} from 'state/selectors';
import { getSiteSlug, isSitePreviewable } from 'state/sites/selectors';

class PostControls extends Component {
	getControlElements = ( controls ) => {
		const elements = controls.map( ( control, index ) => {
			return (
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
						<span className="posts__post-controls-text">
							{ control.text }
							{ control.count > 0 && <Count count={ control.count } /> }
						</span>
					</a>
				</li>
			);
		} );

		return elements;
	}

	getAvailableControls = () => {
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
		} = this.props;
		const controls = { main: [], more: [] };
		const edit = () => ga.recordEvent( 'Posts', 'Clicked Edit Post' );
		const copy = () => ga.recordEvent( 'Posts', 'Clicked Copy Post' );
		const viewStats = () => ga.recordEvent( 'Posts', 'Clicked View Post Stats' );

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
				icon: this.props.isPreviewable ? 'visible' : 'external',
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
					count: this.props.scheduledActionsCount,
					disabled: ! this.props.isPublicizeEnabled,
					icon: 'share',
					onClick: onToggleShare,
					text: translate( 'Share' ),
				} );
			}
		} else if ( 'trash' !== post.status ) {
			controls.main.push( {
				className: 'view' + ( current === 'preview' ? ' is-active' : '' ),
				icon: this.props.isPreviewable ? 'visible' : 'external',
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
	}

	render() {
		const { main, more } = this.getAvailableControls();
		const classes = classNames(
			'post-controls',
			{ 'post-controls--desk-nomore': more <= 2 }
		);
		const { siteId, post } = this.props;

		return (
			<div className={ classes }>
				{ isEnabled( 'republicize' ) && this.props.isPublicizeEnabled &&
					<QuerySharePostActions
						siteId={ siteId }
						postId={ post.ID }
						status={ SCHEDULED } />
				}
				{ more.length > 0 &&
					<ul className="posts__post-controls post-controls__pane post-controls__more-options">
						{ this.getControlElements( more ) }
					</ul>
				}
				<ul className="posts__post-controls post-controls__pane post-controls__main-options">
					{ this.getControlElements( main ) }
				</ul>
			</div>
		);
	}
}

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
	scheduledActionsCount: getPostShareScheduledActions( state, siteId, post.ID ).length,
	siteSlug: getSiteSlug( state, siteId ),
} ) )( localize( PostControls ) );
