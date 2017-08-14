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

		this.handleHeightChange = this.handleHeightChange.bind( this );

		this.state = {
			nodeHeight: 0,
		};
	}

	componentDidUpdate() {
		this.handleHeightChange();
	}

	handleHeightChange() {
		const domNode = findDOMNode( this );
		const nodeHeight = domNode && domNode.clientHeight;

		if ( nodeHeight && nodeHeight !== this.state.nodeHeight ) {
			this.setState( { nodeHeight } );
			this.props.onHeightChange( { nodeHeight, globalId: this.props.globalId } );
		}
	}

	componentDidMount() {
		this.handleHeightChange();
	}

	componentDidUpdate() {
		this.handleHeightChange();
	}

	hideCurrentSharePanel = () => {
		this.props.hideSharePanel( this.props.globalId );
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
			isCurrentSharePanelOpen,
			translate,
		} = this.props;

		const title = post ? post.title : null;
		const siteId = post ? post.site_ID : null;

		const postItemClasses = classnames( 'post-item', className, {
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

		return (
			<div>
				<Card compact className={ postItemClasses }>
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
				{ post && isCurrentSharePanelOpen && (
					<PostShare
						post={ post }
						siteId={ siteId }
						showClose={ true }
						onClose={ this.hideCurrentSharePanel }
					/>
				) }
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
