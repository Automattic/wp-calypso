/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import url from 'url';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flow, noop } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'gridicons';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import PostRelativeTimeStatus from 'my-sites/post-relative-time-status';
import actions from 'lib/posts/actions';
import photon from 'photon';
import { hasTouch } from 'lib/touch-detect';
import updatePostStatus from 'components/update-post-status';
import { getEditURL, getPreviewURL, userCan } from 'lib/posts/utils';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSite } from 'state/sites/selectors';
import TimeSince from 'components/time-since';

class Draft extends Component {
	static propTypes = {
		post: PropTypes.object,
		isPlaceholder: PropTypes.bool,
		onTitleClick: PropTypes.func,
		postImages: PropTypes.object,
		selected: PropTypes.bool,
		showAuthor: PropTypes.bool,

		// via `localize`
		translate: PropTypes.func.isRequired,

		// via `updatePostStatus`
		updatePostStatus: PropTypes.func.isRequired,
	};

	static defaultProps = {
		showAllActions: false,
		onTitleClick: noop,
		selected: false,
		showAuthor: false,
	};

	state = {
		showPopoverMenu: false,
		hasError: false,
	};

	trashPost = () => {
		this.setState( {
			showPopoverMenu: false,
			isTrashing: true,
		} );

		const updateStatus = function( error ) {
			if ( ! this.isMounted() ) {
				return;
			}

			if ( error ) {
				return this.setState( {
					isTrashing: false,
					hasError: true,
				} );
			}

			return this.setState( { isTrashing: false } );
		}.bind( this );

		if ( userCan( 'delete_post', this.props.post ) ) {
			actions.trash( this.props.site, this.props.post, updateStatus );
		}
	};

	restorePost = () => {
		this.setState( {
			showPopoverMenu: false,
			isRestoring: true,
		} );

		const updateStatus = function( error ) {
			if ( ! this.isMounted() ) {
				return;
			}

			if ( error ) {
				return this.setState( {
					isRestoring: false,
					hasError: true,
				} );
			}

			return this.setState( { isRestoring: false } );
		}.bind( this );

		if ( userCan( 'delete_post', this.props.post ) ) {
			actions.restore( this.props.site, this.props.post, updateStatus );
		}
	};

	previewPost = () => {
		window.open( getPreviewURL( this.props.site, this.props.post ) );
	};

	publishPost = () => {
		this.setState( { showPopoverMenu: false } );
		if ( userCan( 'publish_post', this.props.post ) ) {
			this.props.updatePostStatus( 'publish' );
		}
	};

	togglePopoverMenu = () => {
		this.setState( {
			showPopoverMenu: ! this.state.showPopoverMenu,
		} );
	};

	render() {
		const { post } = this.props;
		let image = null;
		let imageUrl, editPostURL;

		if ( this.props.isPlaceholder ) {
			return this.postPlaceholder();
		}

		const site = this.props.site;

		if ( userCan( 'edit_post', post ) ) {
			editPostURL = getEditURL( post, site );
		}

		if ( this.props.postImages && this.props.postImages.canonical_image ) {
			image = url.parse( this.props.postImages.canonical_image.uri, true );
			imageUrl = '//' + image.hostname + image.pathname + '?w=680px';
		}

		if ( post && post.canonical_image ) {
			image = url.parse( post.canonical_image.uri, true );

			if ( image.hostname.indexOf( 'files.wordpress.com' ) > 0 ) {
				imageUrl = '//' + image.hostname + image.pathname + '?w=680px';
			} else {
				imageUrl = photon( post.canonical_image.uri, { width: 680 } );
			}
		}

		const classes = classnames( 'draft', `is-${ post.format }`, {
			'has-image': !! image,
			'is-placeholder': this.props.isPlaceholder,
			'is-touch': hasTouch(),
			'is-selected': this.props.selected,
		} );

		const title = post.title || (
			<span className="draft__empty-text">{ this.props.translate( 'Untitled' ) }</span>
		);

		// Render each Post
		return (
			<CompactCard
				className={ classes }
				key={ 'draft-' + post.ID }
				href={ editPostURL }
				onClick={ this.props.onTitleClick }
			>
				<h3 className="draft__title">{ title }</h3>
				<TimeSince className="draft__time" date={ post.modified } />
				{ image ? this.renderImage( imageUrl ) : null }
			</CompactCard>
		);
	}

	renderImage( image ) {
		const style = { backgroundImage: 'url(' + image + ')' };
		return <div className="draft__featured-image" style={ style } />;
	}

	restoreButton() {
		if ( this.state.isRestoring ) {
			return null;
		}

		return (
			<button className="draft__restore" onClick={ this.restorePost }>
				<Gridicon icon="undo" size={ 18 } />
				{ this.props.translate( 'Restore' ) }
			</button>
		);
	}

	showStatusChange() {
		if ( this.props.post.status === 'publish' ) {
			return (
				<Notice
					isCompact={ true }
					status="is-success"
					text={ 'Post successfully published.' }
					button={ 'View' }
					showDismiss={ false }
				>
					<NoticeAction href={ this.props.post.URL }>{ 'View' }</NoticeAction>
				</Notice>
			);
		} else if ( this.state.hasError ) {
			return (
				<Notice
					isCompact={ true }
					status="is-error"
					text={ 'There was a problem.' }
					showDismiss={ false }
				/>
			);
		}
	}

	postPlaceholder() {
		return (
			<CompactCard className="draft is-placeholder">
				<h3 className="draft__title" />
				<div className="draft__actions">
					<p className="post-relative-time-status">
						<span className="time">
							<Gridicon icon="time" size={ 18 } />
							<span className="time-text" />
						</span>
					</p>
				</div>
			</CompactCard>
		);
	}

	renderTrashAction() {
		if ( ! userCan( 'delete_post', this.props.post ) ) {
			return null;
		}

		if ( this.props.post.status === 'trash' || this.state.isRestoring ) {
			return null;
		}

		return (
			<div className="draft__actions">
				<Gridicon icon="trash" onClick={ this.trashPost } size={ 18 } />
			</div>
		);
	}

	renderAllActions() {
		return (
			<div className="draft__all-actions">
				<PostRelativeTimeStatus post={ this.props.post } includeEditLink={ true } />
				<Gridicon
					className="draft__actions-toggle"
					onClick={ this.togglePopoverMenu }
					ref="popoverMenuButton"
					icon="ellipsis"
					size={ 18 }
				/>
				<PopoverMenu
					isVisible={ this.state.showPopoverMenu }
					onClose={ this.togglePopoverMenu }
					position={ 'bottom left' }
					context={ this.refs && this.refs.popoverMenuButton }
				>
					<PopoverMenuItem onClick={ this.previewPost }>
						{ this.props.translate( 'Preview' ) }
					</PopoverMenuItem>
					<PopoverMenuItem onClick={ this.publishPost }>
						{ this.props.translate( 'Publish' ) }
					</PopoverMenuItem>
					<PopoverMenuItem className="draft__trash-item" onClick={ this.trashPost }>
						{ this.props.translate( 'Send to Trash' ) }
					</PopoverMenuItem>
				</PopoverMenu>
			</div>
		);
	}

	draftActions() {
		return this.props.showAllActions ? this.renderAllActions() : this.renderTrashAction();
	}
}

const mapState = ( state, { siteId } ) => ( {
	site: getSite( state, siteId ),
	selectedSiteId: getSelectedSiteId( state ),
} );

export default flow( localize, updatePostStatus, connect( mapState ) )( Draft );
