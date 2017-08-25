/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { getEditorPath } from 'state/ui/editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getNormalizedPost } from 'state/posts/selectors';
import { isSingleUserSite, getSite, getSiteTitle } from 'state/sites/selectors';
import { areAllSitesSingleUser } from 'state/selectors';
import { isSharePanelOpen } from 'state/ui/post-type-list/selectors';
import { hideSharePanel } from 'state/ui/post-type-list/actions';
import Card from 'components/card';
import PostRelativeTime from 'blocks/post-relative-time';
import PostStatus from 'blocks/post-status';
import PostShare from 'blocks/post-share';
import PostTypeListPostThumbnail from 'my-sites/post-type-list/post-thumbnail';
import PostActionsEllipsisMenu from 'my-sites/post-type-list/post-actions-ellipsis-menu';
import PostTypeSiteInfo from 'my-sites/post-type-list/post-type-site-info';
import PostTypePostAuthor from 'my-sites/post-type-list/post-type-post-author';

class PostItem extends React.Component {

	static defaultProps = {
		onHeightChange: noop,
	};

	constructor() {
		super( ...arguments );

		this.state = {
			nodeHeight: 0,
		};

		this.hasVariableHeightContent = false;
	}

	componentDidMount() {
		this.manageMutationObserver();
	}

	componentDidUpdate() {
		this.manageMutationObserver();
	}

	componentWillUnmount() {
		this.disconnectMutationObserver();
	}

	manageMutationObserver() {
		if ( this.hasVariableHeightContent && ! this.observer ) {
			// Post item has expanded content but didn't previously (or is
			// newly mounted with expanded content).  Watch for further height
			// changes and update current height.
			this.connectMutationObserver();
			this.handleHeightChange();
		} else if ( ! this.hasVariableHeightContent && this.observer ) {
			// Post item had expanded content previously but not any more.
			// Stop watching for height changes and update current height.
			this.disconnectMutationObserver();
			this.handleHeightChange();
		}
	}

	connectMutationObserver() {
		if ( this.observer ) {
			return;
		}
		this.observer = new window.MutationObserver( this.handleHeightChange );
		this.observer.observe( findDOMNode( this ), {
			childList: true,
			subtree: true,
		} );
	}

	disconnectMutationObserver() {
		if ( ! this.observer ) {
			return;
		}
		this.observer.disconnect();
		delete this.observer;
	}

	handleHeightChange = () => {
		const domNode = findDOMNode( this );
		if ( ! domNode ) {
			return;
		}

		const style = window.getComputedStyle( domNode );
		const nodeHeight = domNode.clientHeight +
			parseInt( style.marginTop, 10 ) +
			parseInt( style.marginBottom, 10 );

		if ( nodeHeight && nodeHeight !== this.state.nodeHeight ) {
			this.setState( { nodeHeight } );
			this.props.onHeightChange( { nodeHeight, globalId: this.props.globalId } );
		}
	}

	hideCurrentSharePanel = () => {
		this.props.hideSharePanel( this.props.globalId );
	}

	inAllSitesModeWithMultipleUsers() {
		return this.props.isAllSitesModeSelected && ! this.props.allSitesSingleUser;
	}

	inSingleSiteModeWithMultipleUsers() {
		return ! this.props.isAllSitesModeSelected && ! this.props.singleUserSite;
	}

	renderVariableHeightContent() {
		const {
			post,
			isCurrentSharePanelOpen,
		} = this.props;

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
			site,
			siteTitle,
			isAllSitesModeSelected,
			compact,
			editUrl,
			translate,
		} = this.props;

		const title = post ? post.title : null;

		const cardClasses = classnames( 'post-item__card', className, {
			'is-untitled': ! title,
			'is-mini': compact,
			'is-placeholder': ! globalId
		} );

		const isSiteVisible = (
			isEnabled( 'posts/post-type-list' ) &&
			isAllSitesModeSelected
		);

		const isAuthorVisible = ( this.inAllSitesModeWithMultipleUsers() || this.inSingleSiteModeWithMultipleUsers() ) &&
			post && post.author && isEnabled( 'posts/post-type-list' );

		const titleMetaClasses = classnames( 'post-item__title-meta', {
			'site-is-visible': isSiteVisible || isAuthorVisible
		} );

		const variableHeightContent = this.renderVariableHeightContent();
		this.hasVariableHeightContent = !! variableHeightContent;

		const rootClasses = classnames( 'post-item', {
			'is-expanded': this.hasVariableHeightContent,
		} );

		return (
			<div className={ rootClasses }>
				<Card compact className={ cardClasses }>
					<div className="post-item__detail">
						<div className={ titleMetaClasses }>
							<div className="post-item__info">
								<PostTypeSiteInfo globalId={ globalId } />
								<PostTypePostAuthor globalId={ globalId } />
							</div>
							<h1 className="post-item__title">
								<a href={ editUrl } className="post-item__title-link">
									{ title || translate( 'Untitled' ) }
								</a>
							</h1>
							<div className="post-item__meta">
								<PostRelativeTime globalId={ globalId } />
								<PostStatus globalId={ globalId } />
							</div>
						</div>
					</div>
					<PostTypeListPostThumbnail globalId={ globalId } />
					<PostActionsEllipsisMenu globalId={ globalId } />
				</Card>
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
	className: PropTypes.string,
	compact: PropTypes.bool,
	onHeightChange: PropTypes.func,
	isCurrentSharePanelOpen: PropTypes.bool,
	hideSharePanel: PropTypes.func,
};

export default connect( ( state, { globalId } ) => {
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
	};
}, {
	hideSharePanel,
} )( localize( PostItem ) );
