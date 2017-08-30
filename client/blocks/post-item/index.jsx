/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
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
import { getSite, getSiteTitle } from 'state/sites/selectors';
import { isSharePanelOpen } from 'state/ui/post-type-list/selectors';
import { hideSharePanel } from 'state/ui/post-type-list/actions';
import SiteIcon from 'blocks/site-icon';
import Card from 'components/card';
import PostRelativeTime from 'blocks/post-relative-time';
import PostStatus from 'blocks/post-status';
import PostShare from 'blocks/post-share';
import PostTypeListPostThumbnail from 'my-sites/post-type-list/post-thumbnail';
import PostActionsEllipsisMenu from 'my-sites/post-type-list/post-actions-ellipsis-menu';
import PostTypePostAuthor from 'my-sites/post-type-list/post-type-post-author';

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
		const titleMetaClasses = classnames( 'post-item__title-meta', {
			'site-is-visible': isSiteVisible
		} );

		const variableHeightContent = this.renderVariableHeightContent();
		this.hasVariableHeightContent = !! variableHeightContent;

		const rootClasses = classnames( 'post-item', {
			'is-expanded': this.hasVariableHeightContent,
		} );

		return (
			<div
				className={ rootClasses }
				ref={ node => this.node = node }
			>
				<Card compact className={ cardClasses }>
					<div className="post-item__detail">
						<div className={ titleMetaClasses }>
							{ isSiteVisible && (
								<div className="post-item__site">
									<SiteIcon size={ 16 } site={ site } />
									<div className="post-item__site-title">
										{ siteTitle }
									</div>
								</div>
							) }
							<h1 className="post-item__title">
								<a href={ editUrl } className="post-item__title-link">
									{ title || translate( 'Untitled' ) }
								</a>
							</h1>
							<div className="post-item__meta">
								<PostRelativeTime globalId={ globalId } />
								<PostStatus globalId={ globalId } />
								<PostTypePostAuthor globalId={ globalId } />
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
	post: PropTypes.object,
	site: PropTypes.object,
	siteTitle: PropTypes.string,
	isAllSitesModeSelected: PropTypes.bool,
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
		site: getSite( state, siteId ),
		siteTitle: getSiteTitle( state, siteId ),
		isAllSitesModeSelected: getSelectedSiteId( state ) === null,
		editUrl: getEditorPath( state, siteId, post.ID ),
		isCurrentSharePanelOpen: isSharePanelOpen( state, globalId ),
	};
}, {
	hideSharePanel,
} )( localize( PostItem ) );
