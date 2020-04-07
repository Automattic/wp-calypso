/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight as compose, get, noop } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

/**
 * Internal Dependencies
 */
import { Button, Dialog } from '@automattic/components';
import SupportArticleHeader from './header';
import Placeholders from './placeholders';
import EmbedContainer from 'components/embed-container';
import Emojify from 'components/emojify';
import QueryReaderPost from 'components/data/query-reader-post';
import QueryReaderSite from 'components/data/query-reader-site';
import { getPostByKey } from 'state/reader/posts/selectors';
import { SUPPORT_BLOG_ID } from 'blocks/inline-help/constants';
import getInlineSupportArticlePostId from 'state/selectors/get-inline-support-article-post-id';
import getInlineSupportArticleActionUrl from 'state/selectors/get-inline-support-article-action-url';
import getInlineSupportArticleActionLabel from 'state/selectors/get-inline-support-article-action-label';
import getInlineSupportArticleActionIsExternal from 'state/selectors/get-inline-support-article-action-is-external';
import { closeSupportArticleDialog } from 'state/inline-support-article/actions';

/**
 * Style Dependencies
 */
import './style.scss';
import './content.scss';

export class SupportArticleDialog extends Component {
	static propTypes = {
		actionIsExternal: PropTypes.bool,
		actionLabel: PropTypes.string,
		actionUrl: PropTypes.string,
		closeSupportArticleDialog: PropTypes.func.isRequired,
		post: PropTypes.object,
		postId: PropTypes.number,
		translate: PropTypes.func.isRequired,
	};

	getDialogButtons() {
		const { actionIsExternal, actionLabel, actionUrl, translate } = this.props;
		return [
			<Button onClick={ this.props.closeSupportArticleDialog }>
				{ translate( 'Close', { textOnly: true } ) }
			</Button>,
			actionUrl && (
				<Button
					href={ actionUrl }
					target={ actionIsExternal ? '_blank' : undefined }
					primary
					onClick={ () => ( actionIsExternal ? noop() : this.props.closeSupportArticleDialog() ) }
				>
					{ actionLabel } { actionIsExternal && <Gridicon icon="external" size={ 12 } /> }
				</Button>
			),
		].filter( Boolean );
	}

	render() {
		const { post, postId } = this.props;
		const isLoading = ! post;
		const postKey = { blogId: SUPPORT_BLOG_ID, postId };
		const siteId = get( post, 'site_ID' );

		/*eslint-disable react/no-danger */
		return (
			<Dialog
				isVisible
				additionalClassNames="support-article-dialog"
				buttons={ this.getDialogButtons() }
				onCancel={ this.props.closeSupportArticleDialog }
				onClose={ this.props.closeSupportArticleDialog }
			>
				<Emojify>
					{ siteId && <QueryReaderSite siteId={ +siteId } /> }
					{ isLoading && <QueryReaderPost postKey={ postKey } /> }
					<article className="support-article-dialog__story">
						<SupportArticleHeader post={ post } isLoading={ isLoading } />
						{ isLoading ? (
							<Placeholders />
						) : (
							<EmbedContainer>
								<div
									className="support-article-dialog__story-content"
									dangerouslySetInnerHTML={ { __html: get( post, 'content' ) } }
								/>
							</EmbedContainer>
						) }
					</article>
				</Emojify>
			</Dialog>
		);
		/*eslint-enable react/no-danger */
	}
}

export default compose(
	connect(
		state => {
			const postId = getInlineSupportArticlePostId( state );
			const actionUrl = getInlineSupportArticleActionUrl( state );
			const actionLabel = getInlineSupportArticleActionLabel( state );
			const actionIsExternal = getInlineSupportArticleActionIsExternal( state );
			const post = getPostByKey( state, { blogId: SUPPORT_BLOG_ID, postId } );

			return { post, postId, actionUrl, actionLabel, actionIsExternal };
		},
		{ closeSupportArticleDialog }
	),
	localize
)( SupportArticleDialog );
