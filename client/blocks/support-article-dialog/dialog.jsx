/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight as compose, get } from 'lodash';
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
import getInlineSupportArticlePostUrl from 'state/selectors/get-inline-support-article-post-url';
import { closeSupportArticleDialog } from 'state/inline-support-article/actions';

/**
 * Style Dependencies
 */
import './style.scss';
import './content.scss';

export class SupportArticleDialog extends Component {
	static propTypes = {
		closeSupportArticleDialog: PropTypes.func.isRequired,
		post: PropTypes.object,
		postId: PropTypes.number,
		postUrl: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	getDialogButtons() {
		const { postUrl, translate } = this.props;
		return [
			postUrl && (
				<Button href={ postUrl } target="_blank" primary>
					{ translate( 'Visit Article' ) } <Gridicon icon="external" size={ 12 } />
				</Button>
			),
			<Button onClick={ this.props.closeSupportArticleDialog }>
				{ translate( 'Close', { textOnly: true } ) }
			</Button>,
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
			const postUrl = getInlineSupportArticlePostUrl( state );
			const post = getPostByKey( state, { blogId: SUPPORT_BLOG_ID, postId } );

			return { post, postId, postUrl };
		},
		{ closeSupportArticleDialog }
	),
	localize
)( SupportArticleDialog );
