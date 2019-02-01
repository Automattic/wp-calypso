/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import pageRouter from 'page';
import { connect } from 'react-redux';
import { flow, get, includes, noop, partial } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'gridicons';
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import SiteIcon from 'blocks/site-icon';
import { statsLinkForPage } from '../helpers';
import * as utils from 'state/posts/utils';
import classNames from 'classnames';
import MenuSeparator from 'components/popover/menu-separator';
import PageCardInfo from '../page-card-info';
import { preload } from 'sections-helper';
import {
	getSite,
	hasStaticFrontPage,
	isSitePreviewable,
	isJetpackMinimumVersion,
} from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isFrontPage, isPostsPage } from 'state/pages/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';
import { setPreviewUrl } from 'state/ui/preview/actions';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { savePost, deletePost, trashPost, restorePost } from 'state/posts/actions';
import { withoutNotice } from 'state/notices/actions';
import { isEnabled } from 'config';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import isCalypsoifyGutenbergEnabled from 'state/selectors/is-calypsoify-gutenberg-enabled';
import getEditorUrl from 'state/selectors/get-editor-url';
import {
	getEditorDuplicatePostPath,
	getCalypsoifyEditorDuplicatePostPath,
} from 'state/ui/editor/selectors';

const recordEvent = partial( recordGoogleEvent, 'Pages' );

function preloadEditor() {
	preload( 'post-editor' );
}

function sleep( ms ) {
	return new Promise( r => setTimeout( r, ms ) );
}

const ShadowNotice = localize( ( { shadowStatus, onUndoClick, translate } ) => (
	<div className="page__shadow-notice-cover">
		<Notice
			className="page__shadow-notice"
			isCompact
			inline
			text={ shadowStatus.text }
			status={ shadowStatus.status }
			icon={ shadowStatus.icon }
			isLoading={ shadowStatus.isLoading }
		>
			{ shadowStatus.undo && (
				<NoticeAction onClick={ onUndoClick }>{ translate( 'Undo' ) }</NoticeAction>
			) }
		</Notice>
	</div>
) );

class Page extends Component {
	static propTypes = {
		// connected
		setPreviewUrl: PropTypes.func.isRequired,
		setLayoutFocus: PropTypes.func.isRequired,
		recordEvent: PropTypes.func.isRequired,
		recordMoreOptions: PropTypes.func.isRequired,
		recordPageTitle: PropTypes.func.isRequired,
		recordEditPage: PropTypes.func.isRequired,
		recordViewPage: PropTypes.func.isRequired,
		recordStatsPage: PropTypes.func.isRequired,
	};

	static defaultProps = {
		onShadowStatusChange: noop,
	};

	// Construct a link to the Site the page belongs too
	getSiteDomain() {
		return ( this.props.site && this.props.site.domain ) || '...';
	}

	viewPage = event => {
		event.preventDefault();
		const { isPreviewable, page, previewURL } = this.props;

		if ( page.status && page.status === 'publish' ) {
			this.props.recordViewPage();
		}

		if ( ! isPreviewable && typeof window === 'object' ) {
			return window.open( previewURL );
		}

		this.props.setPreviewUrl( previewURL );
		this.props.setLayoutFocus( 'preview' );
	};

	getViewItem() {
		const { isPreviewable } = this.props;
		if ( this.props.page.status === 'trash' ) {
			return null;
		}

		if ( this.props.hasStaticFrontPage && this.props.isPostsPage ) {
			return null;
		}

		if ( this.props.page.status !== 'publish' ) {
			return (
				<PopoverMenuItem onClick={ this.viewPage }>
					<Gridicon icon={ isPreviewable ? 'visible' : 'external' } size={ 18 } />
					{ this.props.translate( 'Preview' ) }
				</PopoverMenuItem>
			);
		}

		return (
			<PopoverMenuItem onClick={ this.viewPage }>
				<Gridicon icon={ isPreviewable ? 'visible' : 'external' } size={ 18 } />
				{ this.props.translate( 'View Page' ) }
			</PopoverMenuItem>
		);
	}

	childPageInfo() {
		const { parentEditorUrl, page, translate } = this.props;

		// If we're in hierarchical view, we don't show child info in the context menu, as it's redudant.
		if ( this.props.hierarchical || ! page.parent ) {
			return null;
		}

		const parentTitle = page.parent.title || translate( '( Untitled )' );

		// This is technically if you can edit the current page, not the parent.
		// Capabilities are not exposed on the parent page.
		const parentHref = utils.userCan( 'edit_post', this.props.page )
			? parentEditorUrl
			: page.parent.URL;
		const parentLink = <a href={ parentHref }>{ parentTitle }</a>;

		return (
			<div className="page__popover-more-info">
				{ translate( 'Child of {{PageTitle/}}', {
					components: {
						PageTitle: parentLink,
					},
				} ) }
			</div>
		);
	}

	frontPageInfo() {
		if ( ! this.props.isFrontPage ) {
			return null;
		}

		return (
			<div className="page__popover-more-info">
				{ this.props.translate( "This page is set as your site's homepage" ) }
			</div>
		);
	}

	getPublishItem() {
		if (
			this.props.page.status === 'publish' ||
			! utils.userCan( 'publish_post', this.props.page ) ||
			this.props.page.status === 'trash'
		) {
			return null;
		}

		return (
			<PopoverMenuItem onClick={ this.updateStatusPublish }>
				<Gridicon icon="checkmark" size={ 18 } />
				{ this.props.translate( 'Publish' ) }
			</PopoverMenuItem>
		);
	}

	getEditItem() {
		if ( this.props.hasStaticFrontPage && this.props.isPostsPage ) {
			return null;
		}

		if ( ! utils.userCan( 'edit_post', this.props.page ) ) {
			return null;
		}

		if ( this.props.calypsoifyGutenberg ) {
			return (
				<PopoverMenuItem onClick={ this.props.recordEditPage } href={ this.props.editorUrl }>
					<Gridicon icon="pencil" size={ 18 } />
					{ this.props.translate( 'Edit' ) }
				</PopoverMenuItem>
			);
		}

		return (
			<PopoverMenuItem
				onClick={ this.editPage }
				onMouseOver={ preloadEditor }
				onFocus={ preloadEditor }
			>
				<Gridicon icon="pencil" size={ 18 } />
				{ this.props.translate( 'Edit' ) }
			</PopoverMenuItem>
		);
	}

	setFrontPage() {
		alert( 'This feature is still being developed.' );
	}

	getFrontPageItem() {
		if ( ! isEnabled( 'manage/pages/set-front-page' ) ) {
			return null;
		}

		if ( this.props.hasStaticFrontPage && this.props.isPostsPage ) {
			return null;
		}

		if ( ! utils.userCan( 'edit_post', this.props.page ) ) {
			return null;
		}

		return [
			<MenuSeparator key="separator" />,
			<PopoverMenuItem key="item" onClick={ this.setFrontPage }>
				<Gridicon icon="house" size={ 18 } />
				{ this.props.translate( 'Set as Front Page' ) }
			</PopoverMenuItem>,
		];
	}

	getSendToTrashItem() {
		if ( ( this.props.hasStaticFrontPage && this.props.isPostsPage ) || this.props.isFrontPage ) {
			return null;
		}

		if ( ! utils.userCan( 'delete_post', this.props.page ) ) {
			return null;
		}

		if ( this.props.page.status !== 'trash' ) {
			return [
				<MenuSeparator key="separator" />,
				<PopoverMenuItem key="item" className="page__trash-item" onClick={ this.updateStatusTrash }>
					<Gridicon icon="trash" size={ 18 } />
					{ this.props.translate( 'Trash' ) }
				</PopoverMenuItem>,
			];
		}

		return [
			<MenuSeparator key="separator" />,
			<PopoverMenuItem key="item" className="page__delete-item" onClick={ this.updateStatusDelete }>
				<Gridicon icon="trash" size={ 18 } />
				{ this.props.translate( 'Delete' ) }
			</PopoverMenuItem>,
		];
	}

	getCopyItem() {
		const { page: post, duplicateUrl } = this.props;
		if (
			! includes( [ 'draft', 'future', 'pending', 'private', 'publish' ], post.status ) ||
			! utils.userCan( 'edit_post', post )
		) {
			return null;
		}
		return (
			<PopoverMenuItem onClick={ this.copyPage } href={ duplicateUrl }>
				<Gridicon icon="clipboard" size={ 18 } />
				{ this.props.translate( 'Copy' ) }
			</PopoverMenuItem>
		);
	}

	getRestoreItem() {
		if ( this.props.page.status !== 'trash' || ! utils.userCan( 'delete_post', this.props.page ) ) {
			return null;
		}

		return (
			<PopoverMenuItem onClick={ this.updateStatusRestore }>
				<Gridicon icon="undo" size={ 18 } />
				{ this.props.translate( 'Restore' ) }
			</PopoverMenuItem>
		);
	}

	statsPage = () => {
		this.props.recordStatsPage();
		pageRouter( statsLinkForPage( this.props.page, this.props.site ) );
	};

	getStatsItem() {
		if ( this.props.page.status !== 'publish' ) {
			return null;
		}

		return (
			<PopoverMenuItem onClick={ this.statsPage }>
				<Gridicon icon="stats" size={ 18 } />
				{ this.props.translate( 'Stats' ) }
			</PopoverMenuItem>
		);
	}

	editPage = () => {
		this.props.recordEditPage();
		pageRouter( this.props.editorUrl );
	};

	getPageStatusInfo() {
		if ( this.props.page.status === 'publish' ) {
			return null;
		}

		return (
			<div className="page__popover-more-info">
				{ this.getReadableStatus( this.props.page.status ) }
			</div>
		);
	}

	getReadableStatus( status ) {
		const { translate } = this.props;
		if ( ! this.humanReadableStatus ) {
			this.humanReadableStatus = {
				publish: translate( 'Published' ),
				draft: translate( 'Draft' ),
				pending: translate( 'Pending' ),
				future: translate( 'Future' ),
				private: translate( 'Private' ),
				trash: translate( 'Trashed' ),
			};
		}

		return this.humanReadableStatus[ status ] || status;
	}

	popoverMoreInfo() {
		const status = this.getPageStatusInfo();
		const childPageInfo = this.childPageInfo();
		const frontPageInfo = this.frontPageInfo();

		if ( ! status && ! childPageInfo && ! frontPageInfo ) {
			return null;
		}

		return (
			<div>
				<MenuSeparator />
				{ status }
				{ childPageInfo }
				{ frontPageInfo }
			</div>
		);
	}

	undoPostStatus = () => this.updatePostStatus( this.props.shadowStatus.undo );

	render() {
		const { editorUrl, page, shadowStatus, translate } = this.props;
		const title = page.title || translate( 'Untitled' );
		const canEdit = utils.userCan( 'edit_post', page );
		const depthIndicator = ! this.props.hierarchical && page.parent && '— ';

		const viewItem = this.getViewItem();
		const publishItem = this.getPublishItem();
		const editItem = this.getEditItem();
		const frontPageItem = this.getFrontPageItem();
		const restoreItem = this.getRestoreItem();
		const sendToTrashItem = this.getSendToTrashItem();
		const copyItem = this.getCopyItem();
		const statsItem = this.getStatsItem();
		const moreInfoItem = this.popoverMoreInfo();
		const hasMenuItems =
			viewItem ||
			publishItem ||
			editItem ||
			statsItem ||
			restoreItem ||
			frontPageItem ||
			sendToTrashItem ||
			moreInfoItem;

		const ellipsisMenu = hasMenuItems && (
			<EllipsisMenu
				className="page__actions-toggle"
				position="bottom left"
				onToggle={ this.handleMenuToggle }
			>
				{ editItem }
				{ publishItem }
				{ viewItem }
				{ statsItem }
				{ copyItem }
				{ restoreItem }
				{ frontPageItem }
				{ sendToTrashItem }
				{ moreInfoItem }
			</EllipsisMenu>
		);

		const shadowNotice = shadowStatus && (
			<ShadowNotice shadowStatus={ shadowStatus } onUndoClick={ this.undoPostStatus } />
		);

		const cardClasses = {
			page: true,
			'is-indented': this.props.hierarchical && this.props.hierarchyLevel > 0,
			'is-untitled': ! page.title,
		};

		const hierarchyIndentClasses = {
			'page__hierarchy-indent': true,
			'is-indented': cardClasses[ 'is-indented' ],
		};

		if ( cardClasses[ 'is-indented' ] ) {
			cardClasses[ 'is-indented-level-' + this.props.hierarchyLevel ] = true;
			hierarchyIndentClasses[ 'is-indented-level-' + this.props.hierarchyLevel ] = true;
		}

		const hierarchyIndent = cardClasses[ 'is-indented' ] && (
			<div className={ classNames( hierarchyIndentClasses ) } />
		);

		return (
			<CompactCard className={ classNames( cardClasses ) }>
				{ hierarchyIndent }
				{ this.props.multisite ? <SiteIcon siteId={ page.site_ID } size={ 34 } /> : null }
				<div className="page__main">
					<a
						className="page__title"
						href={ canEdit ? editorUrl : page.URL }
						title={
							canEdit
								? translate( 'Edit %(title)s', { textOnly: true, args: { title: page.title } } )
								: translate( 'View %(title)s', { textOnly: true, args: { title: page.title } } )
						}
						onClick={ this.props.recordPageTitle }
						onMouseOver={ preloadEditor }
						onFocus={ preloadEditor }
						data-tip-target={ 'page-' + page.slug }
					>
						{ depthIndicator }
						{ title }
					</a>
					<PageCardInfo
						page={ page }
						showTimestamp={ this.props.hierarchical }
						siteUrl={ this.props.multisite && this.getSiteDomain() }
					/>
				</div>
				{ ellipsisMenu }
				{ shadowNotice }
			</CompactCard>
		);
	}

	changeShadowStatus( shadowStatus ) {
		return this.props.onShadowStatusChange( this.props.page.global_ID, shadowStatus );
	}

	async performUpdate( { action, progressNotice, successNotice, errorNotice, undo } ) {
		await this.changeShadowStatus( { ...progressNotice, isLoading: true } );
		try {
			await action();
			if ( undo === 'undo' ) {
				// This update was actually undo. Reset the shadow status immediately
				await this.changeShadowStatus( false );
				return;
			}
			await this.changeShadowStatus( { ...successNotice, undo } );
			if ( undo ) {
				// If undo is offered, keep the success notice displayed indefinitely
				return;
			}
		} catch ( error ) {
			await this.changeShadowStatus( errorNotice );
		}
		// remove the success/error notice after 5 seconds
		await sleep( 5000 );
		await this.changeShadowStatus( false );
	}

	updatePostStatus( status ) {
		const { page, translate } = this.props;

		switch ( status ) {
			case 'delete':
				this.performUpdate( {
					action: () => this.props.deletePost( page.site_ID, page.ID ),
					progressNotice: {
						status: 'is-error',
						icon: 'trash',
						text: translate( 'Deleting…' ),
					},
					successNotice: {
						status: 'is-success',
						text: translate( 'Page deleted.' ),
					},
					errorNotice: {
						status: 'is-error',
						text: translate( 'Failed to delete page.' ),
					},
				} );
				return;

			case 'trash':
				this.performUpdate( {
					action: () => this.props.trashPost( page.site_ID, page.ID, page ),
					undo: page.status !== 'trash' ? 'restore' : 'undo',
					progressNotice: {
						status: 'is-error',
						icon: 'trash',
						text: translate( 'Trashing…' ),
					},
					successNotice: {
						status: 'is-success',
						text: translate( 'Page trashed.' ),
					},
					errorNotice: {
						status: 'is-error',
						text: translate( 'Failed to trash page.' ),
					},
				} );
				return;

			case 'restore':
				this.performUpdate( {
					action: () => this.props.restorePost( page.site_ID, page.ID ),
					undo: page.status === 'trash' ? 'trash' : 'undo',
					progressNotice: {
						status: 'is-warning',
						icon: 'history',
						text: translate( 'Restoring…' ),
					},
					successNotice: {
						status: 'is-success',
						text: translate( 'Page restored.' ),
					},
					errorNotice: {
						status: 'is-error',
						text: translate( 'Failed to restore page.' ),
					},
				} );
				return;

			case 'publish':
				this.performUpdate( {
					action: () => this.props.savePost( page.site_ID, page.ID, { status } ),
					progressNotice: {
						status: 'is-info',
						icon: 'reader',
						text: translate( 'Publishing…' ),
					},
					successNotice: {
						status: 'is-success',
						text: translate( 'Page published.' ),
					},
					errorNotice: {
						status: 'is-error',
						text: translate( 'Failed to publish page.' ),
					},
				} );
		}
	}

	updateStatusPublish = () => {
		this.updatePostStatus( 'publish' );
		this.props.recordEvent( 'Clicked Publish Page' );
	};

	updateStatusTrash = () => {
		this.updatePostStatus( 'trash' );
		this.props.recordEvent( 'Clicked Move to Trash' );
	};

	updateStatusRestore = () => {
		this.updatePostStatus( 'restore' );
		this.props.recordEvent( 'Clicked Restore' );
	};

	updateStatusDelete = () => {
		const deleteWarning = this.props.translate( 'Delete this page permanently?' );
		if ( typeof window === 'object' && window.confirm( deleteWarning ) ) {
			this.updatePostStatus( 'delete' );
		}
		this.props.recordEvent( 'Clicked Delete Page' );
	};

	copyPage = () => {
		this.props.recordEvent( 'Clicked Copy Page' );
	};

	handleMenuToggle = isVisible => {
		if ( isVisible ) {
			// record a GA event when the menu is opened
			this.props.recordMoreOptions();
		}
	};
}

const mapState = ( state, props ) => {
	const pageSiteId = get( props, 'page.site_ID' );
	const site = getSite( state, pageSiteId );
	const siteSlugOrId = get( site, 'slug' ) || get( site, 'ID', null );
	const selectedSiteId = getSelectedSiteId( state );
	const isPreviewable =
		false !== isSitePreviewable( state, pageSiteId ) && site && site.ID === selectedSiteId;
	const calypsoifyGutenberg =
		isCalypsoifyGutenbergEnabled( state, pageSiteId ) &&
		'gutenberg' === getSelectedEditor( state, pageSiteId );
	const duplicateUrl =
		!! calypsoifyGutenberg && isJetpackMinimumVersion( state, pageSiteId, '7.0' )
			? getCalypsoifyEditorDuplicatePostPath( state, props.page.site_ID, props.page.ID )
			: getEditorDuplicatePostPath( state, props.page.site_ID, props.page.ID, 'page' );

	return {
		hasStaticFrontPage: hasStaticFrontPage( state, pageSiteId ),
		isFrontPage: isFrontPage( state, pageSiteId, props.page.ID ),
		isPostsPage: isPostsPage( state, pageSiteId, props.page.ID ),
		isPreviewable,
		previewURL: utils.getPreviewURL( site, props.page ),
		site,
		siteSlugOrId,
		editorUrl: getEditorUrl( state, pageSiteId, get( props, 'page.ID' ), 'page' ),
		parentEditorUrl: getEditorUrl( state, pageSiteId, get( props, 'page.parent.ID' ), 'page' ),
		calypsoifyGutenberg,
		duplicateUrl,
	};
};

const mapDispatch = {
	savePost: withoutNotice( savePost ),
	deletePost: withoutNotice( deletePost ),
	trashPost: withoutNotice( trashPost ),
	restorePost: withoutNotice( restorePost ),
	setPreviewUrl,
	setLayoutFocus,
	recordEvent,
	recordMoreOptions: partial( recordEvent, 'Clicked More Options Menu' ),
	recordPageTitle: partial( recordEvent, 'Clicked Page Title' ),
	recordEditPage: partial( recordEvent, 'Clicked Edit Page' ),
	recordViewPage: partial( recordEvent, 'Clicked View Page' ),
	recordStatsPage: partial( recordEvent, 'Clicked Stats Page' ),
};

export default flow(
	localize,
	connect(
		mapState,
		mapDispatch
	)
)( Page );
