/**
 * External dependencies
 */
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PostShare from 'blocks/post-share';
import PostStatus from 'blocks/post-status';
import PostTime from 'blocks/post-time';
import Card from 'components/card';
import { isEnabled } from 'config';
import PostActionsEllipsisMenu from 'my-sites/post-type-list/post-actions-ellipsis-menu';
import PostTypeListPostThumbnail from 'my-sites/post-type-list/post-thumbnail';
import PostTypePostAuthor from 'my-sites/post-type-list/post-type-post-author';
import PostTypeSiteInfo from 'my-sites/post-type-list/post-type-site-info';
import { getNormalizedPost } from 'state/posts/selectors';
import { areAllSitesSingleUser } from 'state/selectors';
import { isSingleUserSite } from 'state/sites/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';
import { hideSharePanel } from 'state/ui/post-type-list/actions';
import { isSharePanelOpen } from 'state/ui/post-type-list/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class PostItem extends React.Component {
	static defaultProps = {
		onHeightChange: noop,
	};

	constructor() {
		super( ...arguments );

		this.node = null;
		this.nodeHeight = 0;
		this.hasVariableHeightContent = false;
	}

	componentDidMount() {
		this.manageMutationObserver();
		if ( this.props.wrapTitle ) {
			// Wait for repaint, which may include wrapping the title onto
			// multiple lines, then update height if needed
			// `requestAnimationFrame` is not enough here...
			window.setTimeout( this.handleHeightChange );
		}
	}

	componentDidUpdate( prevProps ) {
		this.manageMutationObserver();
		if ( this.props.windowWidth !== prevProps.windowWidth ) {
			this.handleHeightChange();
		}
	}

	componentWillUnmount() {
		this.disconnectMutationObserver();
	}

	setDomNode = node => {
		this.node = node;
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
		if ( this.observer || ! this.node ) {
			return;
		}
		this.observer = new window.MutationObserver( this.handleHeightChange );
		this.observer.observe( this.node, {
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
		if ( ! this.node ) {
			return;
		}

		const style = window.getComputedStyle( this.node );
		const nodeHeight = this.node.clientHeight +
			parseInt( style.marginTop, 10 ) +
			parseInt( style.marginBottom, 10 );

		if ( nodeHeight && nodeHeight !== this.nodeHeight ) {
			this.nodeHeight = nodeHeight;
			this.props.onHeightChange( { nodeHeight, globalId: this.props.globalId } );
		}
	}

	hideCurrentSharePanel = () => {
		this.props.hideSharePanel( this.props.globalId );
	}

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
		return (
			this.inAllSitesModeWithMultipleUsers() ||
			this.inSingleSiteModeWithMultipleUsers()
		);
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
			isAllSitesModeSelected,
			compact,
			editUrl,
			translate,
			largeTitle,
			wrapTitle,
		} = this.props;

		const title = post ? post.title : null;

		const cardClasses = classnames( 'post-item__card', className, {
			'is-untitled': ! title,
			'is-mini': compact,
			'is-placeholder': ! globalId,
			'has-large-title': largeTitle,
			'has-wrapped-title': wrapTitle,
		} );

		const isSiteInfoVisible = (
			isEnabled( 'posts/post-type-list' ) &&
			isAllSitesModeSelected
		);

		const isAuthorVisible = (
			isEnabled( 'posts/post-type-list' ) &&
			this.hasMultipleUsers() &&
			! compact &&
			post && post.author
		);

		const variableHeightContent = this.renderVariableHeightContent();
		this.hasVariableHeightContent = !! variableHeightContent;

		const rootClasses = classnames( 'post-item', {
			'is-expanded': this.hasVariableHeightContent,
		} );

		return (
			<div
				className={ rootClasses }
				ref={ this.setDomNode }
			>
				<Card compact className={ cardClasses }>
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
	singleUserQuery: PropTypes.bool,
	className: PropTypes.string,
	compact: PropTypes.bool,
	onHeightChange: PropTypes.func,
	isCurrentSharePanelOpen: PropTypes.bool,
	hideSharePanel: PropTypes.func,
	largeTitle: PropTypes.bool,
	wrapTitle: PropTypes.bool,
	windowWidth: PropTypes.number,
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
