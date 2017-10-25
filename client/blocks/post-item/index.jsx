/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { getEditorPath } from 'state/ui/editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getNormalizedPost } from 'state/posts/selectors';
import { isSingleUserSite } from 'state/sites/selectors';
import { areAllSitesSingleUser } from 'state/selectors';
import {
	isSharePanelOpen,
	isMultiSelectEnabled,
	isPostSelected,
} from 'state/ui/post-type-list/selectors';
import { hideSharePanel, togglePostSelection } from 'state/ui/post-type-list/actions';
import FormInputCheckbox from 'components/forms/form-checkbox';
import PostTime from 'blocks/post-time';
import PostStatus from 'blocks/post-status';
import PostShare from 'blocks/post-share';
import PostTypeListPostThumbnail from 'my-sites/post-type-list/post-thumbnail';
import PostActionsEllipsisMenu from 'my-sites/post-type-list/post-actions-ellipsis-menu';
import PostTypeSiteInfo from 'my-sites/post-type-list/post-type-site-info';
import PostTypePostAuthor from 'my-sites/post-type-list/post-type-post-author';

class PostItem extends React.Component {
	hideCurrentSharePanel = () => {
		this.props.hideSharePanel( this.props.globalId );
	};

	toggleCurrentPostSelection = event => {
		this.props.togglePostSelection( this.props.globalId );
		event.stopPropagation();
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

	renderSelectionCheckbox() {
		const { multiSelectEnabled, isCurrentPostSelected } = this.props;
		return (
			multiSelectEnabled && (
				<div className="post-item__select" onClick={ this.toggleCurrentPostSelection }>
					<FormInputCheckbox
						checked={ isCurrentPostSelected }
						onClick={ this.toggleCurrentPostSelection }
					/>
				</div>
			)
		);
	}

	renderVariableHeightContent() {
		const { post, isCurrentSharePanelOpen } = this.props;

		if ( ! post || ! isCurrentSharePanelOpen ) {
			return null;
		}

		return (
			<PostShare
				post={ post }
				siteId={ post.site_ID }
				showClose={ true }
				onClose={ this.hideCurrentSharePanel }
			/>
		);
	}

	render() {
		const {
			className,
			post,
			globalId,
			isAllSitesModeSelected,
			editUrl,
			translate,
			largeTitle,
			wrapTitle,
		} = this.props;

		const title = post ? post.title : null;

		const panelClasses = classnames( 'post-item__panel', className, {
			'is-untitled': ! title,
			'is-placeholder': ! globalId,
			'has-large-title': largeTitle,
			'has-wrapped-title': wrapTitle,
		} );

		const isSiteInfoVisible = isEnabled( 'posts/post-type-list' ) && isAllSitesModeSelected;

		const isAuthorVisible =
			isEnabled( 'posts/post-type-list' ) && this.hasMultipleUsers() && post && post.author;

		const variableHeightContent = this.renderVariableHeightContent();
		this.hasVariableHeightContent = !! variableHeightContent;

		const rootClasses = classnames( 'post-item', {
			'is-expanded': this.hasVariableHeightContent,
		} );

		return (
			<div className={ rootClasses } ref={ this.setDomNode }>
				<div className={ panelClasses }>
					{ this.renderSelectionCheckbox() }
					<div className="post-item__detail">
						<div className="post-item__info">
							{ isSiteInfoVisible && <PostTypeSiteInfo globalId={ globalId } /> }
							{ isAuthorVisible && <PostTypePostAuthor globalId={ globalId } /> }
						</div>
						<h1 className="post-item__title">
							<a href={ editUrl } className="post-item__title-link">
								{ title || translate( 'Untitled' ) }
							</a>
						</h1>
						<div className="post-item__meta">
							<PostTime globalId={ globalId } />
							<PostStatus globalId={ globalId } />
						</div>
					</div>
					<PostTypeListPostThumbnail globalId={ globalId } />
					<PostActionsEllipsisMenu globalId={ globalId } />
				</div>
				{ variableHeightContent }
			</div>
		);
	}
}

PostItem.propTypes = {
	translate: PropTypes.func,
	globalId: PropTypes.string,
	editUrl: PropTypes.string,
	post: PropTypes.object,
	isAllSitesModeSelected: PropTypes.bool,
	allSitesSingleUser: PropTypes.bool,
	singleUserSite: PropTypes.bool,
	singleUserQuery: PropTypes.bool,
	className: PropTypes.string,
	compact: PropTypes.bool,
	isCurrentSharePanelOpen: PropTypes.bool,
	hideSharePanel: PropTypes.func,
	largeTitle: PropTypes.bool,
	wrapTitle: PropTypes.bool,
};

export default connect(
	( state, { globalId } ) => {
		const post = getNormalizedPost( state, globalId );
		if ( ! post ) {
			return {};
		}

		const siteId = post.site_ID;

		return {
			post,
			isAllSitesModeSelected: getSelectedSiteId( state ) === null,
			allSitesSingleUser: areAllSitesSingleUser( state ),
			singleUserSite: isSingleUserSite( state, siteId ),
			editUrl: getEditorPath( state, siteId, post.ID ),
			isCurrentSharePanelOpen: isSharePanelOpen( state, globalId ),
			isCurrentPostSelected: isPostSelected( state, globalId ),
			multiSelectEnabled: isMultiSelectEnabled( state ),
		};
	},
	{
		hideSharePanel,
		togglePostSelection,
	}
)( localize( PostItem ) );
