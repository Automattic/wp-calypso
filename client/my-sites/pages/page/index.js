/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import pageRouter from 'page';
import { connect } from 'react-redux';
import { flow, get, includes, partial } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'gridicons';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import SiteIcon from 'blocks/site-icon';
import { editLinkForPage, statsLinkForPage } from '../helpers';
import * as utils from 'lib/posts/utils';
import classNames from 'classnames';
import MenuSeparator from 'components/popover/menu-separator';
import PageCardInfo from '../page-card-info';
import { preload } from 'sections-preload';
import { getSite, hasStaticFrontPage, isSitePreviewable } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isFrontPage, isPostsPage } from 'state/pages/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';
import { setPreviewUrl } from 'state/ui/preview/actions';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { savePost, deletePost, trashPost, restorePost } from 'state/posts/actions';

const recordEvent = partial( recordGoogleEvent, 'Pages' );

function preloadEditor() {
	preload( 'post-editor' );
}

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

	state = {
		showPageActions: false,
	};

	togglePageActions = () => {
		this.setState( { showPageActions: ! this.state.showPageActions }, () => {
			if ( this.state.showPageActions ) {
				this.props.recordMoreOptions();
			}
		} );
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
		const { page, site, translate } = this.props;

		// If we're in hierarchical view, we don't show child info in the context menu, as it's redudant.
		if ( this.props.hierarchical || ! page.parent ) {
			return null;
		}

		const parentTitle = page.parent.title || translate( '( Untitled )' );

		// This is technically if you can edit the current page, not the parent.
		// Capabilities are not exposed on the parent page.
		const parentHref = utils.userCan( 'edit_post', this.props.page )
			? editLinkForPage( page.parent, site )
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

		return (
			<PopoverMenuItem onClick={ this.editPage } onMouseOver={ preloadEditor }>
				<Gridicon icon="pencil" size={ 18 } />
				{ this.props.translate( 'Edit' ) }
			</PopoverMenuItem>
		);
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
		const { page: post, siteSlugOrId } = this.props;
		if (
			! includes( [ 'draft', 'future', 'pending', 'private', 'publish' ], post.status ) ||
			! utils.userCan( 'edit_post', post )
		) {
			return null;
		}
		return (
			<PopoverMenuItem
				onClick={ this.copyPage }
				href={ `/page/${ siteSlugOrId }?copy=${ post.ID }` }
			>
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
		pageRouter( editLinkForPage( this.props.page, this.props.site ) );
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

	render() {
		const { page, site = {}, translate } = this.props;
		const title = page.title || translate( '(no title)' );
		const canEdit = utils.userCan( 'edit_post', page );
		const depthIndicator = ! this.props.hierarchical && page.parent && '— ';

		const viewItem = this.getViewItem();
		const publishItem = this.getPublishItem();
		const editItem = this.getEditItem();
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
			sendToTrashItem ||
			moreInfoItem;

		const popoverMenu = hasMenuItems && (
			<PopoverMenu
				isVisible={ this.state.showPageActions }
				onClose={ this.togglePageActions }
				position={ 'bottom left' }
				context={ this.refs && this.refs.popoverMenuButton }
			>
				{ editItem }
				{ publishItem }
				{ viewItem }
				{ statsItem }
				{ copyItem }
				{ restoreItem }
				{ sendToTrashItem }
				{ moreInfoItem }
			</PopoverMenu>
		);

		const ellipsisGridicon = hasMenuItems && (
			<Gridicon
				icon="ellipsis"
				className={ classNames( 'page__actions-toggle', {
					'is-active': this.state.showPageActions,
				} ) }
				onClick={ this.togglePageActions }
				ref="popoverMenuButton"
			/>
		);

		const cardClasses = {
			page: true,
			'is-indented': this.props.hierarchical && this.props.hierarchyLevel > 0,
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
						href={ canEdit ? editLinkForPage( page, site ) : page.URL }
						title={
							canEdit
								? translate( 'Edit %(title)s', { textOnly: true, args: { title: page.title } } )
								: translate( 'View %(title)s', { textOnly: true, args: { title: page.title } } )
						}
						onClick={ this.props.recordPageTitle }
						onMouseOver={ preloadEditor }
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
				{ ellipsisGridicon }
				{ popoverMenu }
			</CompactCard>
		);
	}

	updatePostStatus( status ) {
		const { page, translate } = this.props;

		switch ( status ) {
			case 'delete':
				const deleteWarning = translate( 'Delete this page permanently?' );

				if ( typeof window === 'object' && window.confirm( deleteWarning ) ) {
					this.props.deletePost( page.site_ID, page.ID );
				}
				return;

			case 'trash':
				this.props.trashPost( page.site_ID, page.ID );
				return;

			case 'restore':
				this.props.restorePost( page.site_ID, page.ID );
				return;

			default:
				this.props.savePost( page.site_ID, page.ID, { status } );
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
		this.updatePostStatus( 'delete' );
		this.props.recordEvent( 'Clicked Delete Page' );
	};

	copyPage = () => {
		this.props.recordEvent( 'Clicked Copy Page' );
	};
}

const mapState = ( state, props ) => {
	const pageSiteId = get( props, 'page.site_ID' );
	const site = getSite( state, pageSiteId );
	const siteSlugOrId = get( site, 'slug' ) || get( site, 'ID', null );
	const selectedSiteId = getSelectedSiteId( state );
	const isPreviewable =
		false !== isSitePreviewable( state, pageSiteId ) && site && site.ID === selectedSiteId;

	return {
		hasStaticFrontPage: hasStaticFrontPage( state, pageSiteId ),
		isFrontPage: isFrontPage( state, pageSiteId, props.page.ID ),
		isPostsPage: isPostsPage( state, pageSiteId, props.page.ID ),
		isPreviewable,
		previewURL: utils.getPreviewURL( site, props.page ),
		site,
		siteSlugOrId,
	};
};

const mapDispatch = {
	savePost,
	deletePost,
	trashPost,
	restorePost,
	setPreviewUrl,
	setLayoutFocus,
	recordEvent,
	recordMoreOptions: partial( recordEvent, 'Clicked More Options Menu' ),
	recordPageTitle: partial( recordEvent, 'Clicked Page Title' ),
	recordEditPage: partial( recordEvent, 'Clicked Edit Page' ),
	recordViewPage: partial( recordEvent, 'Clicked View Page' ),
	recordStatsPage: partial( recordEvent, 'Clicked Stats Page' ),
};

export default flow( localize, connect( mapState, mapDispatch ) )( Page );
