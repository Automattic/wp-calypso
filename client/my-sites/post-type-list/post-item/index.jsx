import { ExternalLink } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import PostShare from 'calypso/blocks/post-share';
import PostRelativeTimeStatus from 'calypso/my-sites/post-relative-time-status';
import { preloadEditor } from 'calypso/sections-preloaders';
import { bumpStat } from 'calypso/state/analytics/actions';
import { getNormalizedPost } from 'calypso/state/posts/selectors';
import { canCurrentUserEditPost } from 'calypso/state/posts/selectors/can-current-user-edit-post';
import areAllSitesSingleUser from 'calypso/state/selectors/are-all-sites-single-user';
import getEditorUrl from 'calypso/state/selectors/get-editor-url';
import { isSingleUserSite } from 'calypso/state/sites/selectors';
import { hideActiveSharePanel } from 'calypso/state/ui/post-type-list/actions';
import { isSharePanelOpen } from 'calypso/state/ui/post-type-list/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PostActionCounts from '../post-action-counts';
import PostActionsEllipsisMenu from '../post-actions-ellipsis-menu';
import PostActionsEllipsisMenuEdit from '../post-actions-ellipsis-menu/edit';
import PostActionsEllipsisMenuTrash from '../post-actions-ellipsis-menu/trash';
import PostTypeListPostThumbnail from '../post-thumbnail';
import PostTypePostAuthor from '../post-type-post-author';
import PostTypeSiteInfo from '../post-type-site-info';

import './style.scss';

class PostItem extends Component {
	clickHandler = ( clickTarget ) => () => {
		this.props.bumpStat( 'calypso_post_item_click', clickTarget );
	};

	inAllSitesModeWithMultipleUsers() {
		return (
			this.props.isAllSitesModeSelected &&
			! this.props.allSitesSingleUser &&
			! this.props.singleUserQuery
		);
	}

	inSingleSiteModeWithMultipleUsers() {
		return (
			! this.props.isAllSitesModeSelected &&
			! this.props.singleUserSite &&
			! this.props.singleUserQuery
		);
	}

	hasMultipleUsers() {
		return this.inAllSitesModeWithMultipleUsers() || this.inSingleSiteModeWithMultipleUsers();
	}

	maybeScrollIntoView() {
		const element = ReactDom.findDOMNode( this );
		const viewportBottom = document.documentElement.clientHeight + window.scrollY;
		const distanceFromBottom = viewportBottom - element.offsetTop;

		if ( distanceFromBottom < 250 ) {
			const desiredOffset = window.scrollY + ( 250 - distanceFromBottom );

			window.scrollTo( 0, desiredOffset );
		}
	}

	componentDidUpdate( prevProps ) {
		const { hasExpandedContent } = this.props;

		if ( ! prevProps.hasExpandedContent && hasExpandedContent ) {
			this.maybeScrollIntoView();
		}
	}

	renderExpandedContent() {
		const { post, hasExpandedContent } = this.props;

		if ( ! post || ! hasExpandedContent ) {
			return null;
		}

		return (
			<PostShare
				post={ post }
				siteId={ post.site_ID }
				showClose
				onClose={ this.props.hideActiveSharePanel }
			/>
		);
	}

	render() {
		const {
			className,
			post,
			externalPostLink,
			postUrl,
			globalId,
			isAllSitesModeSelected,
			translate,
			showPublishedStatus,
			hasExpandedContent,
			isTypeWpBlock,
		} = this.props;

		const ICON_SIZE = 12;

		const title = post ? post.title : null;
		const isPlaceholder = ! globalId;
		const isTrashed = post && 'trash' === post.status;
		const enabledPostLink = isPlaceholder || isTrashed ? null : postUrl;

		const panelClasses = clsx( 'post-item__panel', className, {
			'is-untitled': ! title,
			'is-placeholder': isPlaceholder,
		} );

		const isAuthorVisible = this.hasMultipleUsers() && post && post.author;

		const rootClasses = clsx( 'post-item', {
			'is-expanded': !! hasExpandedContent,
		} );

		return (
			<div className={ rootClasses } ref={ this.setDomNode }>
				<div className={ panelClasses }>
					<div className="post-item__detail">
						<div className="post-item__info">
							{ isAllSitesModeSelected && (
								<a href={ enabledPostLink } className="post-item__site-info-link">
									<PostTypeSiteInfo globalId={ globalId } />
								</a>
							) }
							{ isAuthorVisible && (
								<a href={ enabledPostLink } className="post-item__post-author-link">
									<PostTypePostAuthor globalId={ globalId } />
								</a>
							) }
						</div>
						{ /* eslint-disable jsx-a11y/mouse-events-have-key-events, jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */ }
						<h1
							className="post-item__title"
							onClick={ this.clickHandler( 'title' ) }
							onMouseOver={ preloadEditor }
						>
							{ /* eslint-enable jsx-a11y/mouse-events-have-key-events, jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */ }
							{ ! externalPostLink && ! isTrashed && (
								<a
									href={ enabledPostLink }
									className="post-item__title-link"
									data-e2e-title={ title }
								>
									{ title || translate( 'Untitled' ) }
								</a>
							) }

							{ ! externalPostLink && isTrashed && (
								<span className="post-item__title-link" data-e2e-title={ title }>
									{ title || translate( 'Untitled' ) }
								</span>
							) }

							{ ! isPlaceholder && externalPostLink && (
								<ExternalLink
									icon
									href={ postUrl }
									target="_blank"
									className="post-item__title-link"
								>
									{ title || translate( 'Untitled' ) }
								</ExternalLink>
							) }
						</h1>
						<div className="post-item__meta">
							<span className="post-item__meta-time-status">
								{ post && (
									<PostRelativeTimeStatus
										post={ post }
										link={ enabledPostLink }
										target={ null }
										gridiconSize={ ICON_SIZE }
										includeBasicStatus
										showPublishedStatus={ showPublishedStatus }
									/>
								) }
							</span>
							<PostActionCounts globalId={ globalId } />
						</div>
					</div>
					<PostTypeListPostThumbnail
						globalId={ globalId }
						onClick={ this.clickHandler( 'image' ) }
					/>
					{ isTypeWpBlock ? (
						<PostActionsEllipsisMenu globalId={ globalId } includeDefaultActions={ false }>
							<PostActionsEllipsisMenuEdit key="edit" />
							<PostActionsEllipsisMenuTrash key="trash" />
						</PostActionsEllipsisMenu>
					) : (
						<PostActionsEllipsisMenu globalId={ globalId } />
					) }
				</div>
				{ hasExpandedContent && this.renderExpandedContent() }
			</div>
		);
	}
}

PostItem.propTypes = {
	translate: PropTypes.func,
	globalId: PropTypes.string,
	post: PropTypes.object,
	canEdit: PropTypes.bool,
	postUrl: PropTypes.string,
	isAllSitesModeSelected: PropTypes.bool,
	allSitesSingleUser: PropTypes.bool,
	singleUserSite: PropTypes.bool,
	singleUserQuery: PropTypes.bool,
	className: PropTypes.string,
	compact: PropTypes.bool,
	showPublishedStatus: PropTypes.bool,
	hideActiveSharePanel: PropTypes.func,
	hasExpandedContent: PropTypes.bool,
	isTypeWpBlock: PropTypes.bool,
};

export default connect(
	( state, { globalId } ) => {
		const post = getNormalizedPost( state, globalId );
		if ( ! post ) {
			return {};
		}

		const siteId = post.site_ID;

		// Avoid rendering an external link while loading.
		const externalPostLink = false === canCurrentUserEditPost( state, globalId );
		const postUrl = externalPostLink ? post.URL : getEditorUrl( state, siteId, post.ID, post.type );

		const hasExpandedContent = isSharePanelOpen( state, globalId ) || false;

		return {
			post,
			externalPostLink,
			postUrl,
			isAllSitesModeSelected: getSelectedSiteId( state ) === null,
			allSitesSingleUser: areAllSitesSingleUser( state ),
			singleUserSite: isSingleUserSite( state, siteId ),
			hasExpandedContent,
			isTypeWpBlock: 'wp_block' === post.type,
		};
	},
	{
		bumpStat,
		hideActiveSharePanel,
	}
)( localize( PostItem ) );
