/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { noop } from 'lodash';
import { useTranslate } from 'i18n-calypso';
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
import { closeSupportArticleDialog as closeDialog } from 'state/inline-support-article/actions';

/**
 * Style Dependencies
 */
import './style.scss';
import './content.scss';

export const SupportArticleDialog = ( {
	actionIsExternal,
	actionLabel,
	actionUrl,
	closeSupportArticleDialog,
	post,
	postId,
} ) => {
	const translate = useTranslate();
	const isLoading = ! post;
	const postKey = { blogId: SUPPORT_BLOG_ID, postId };
	const siteId = post?.site_ID;

	useEffect( () => {
		//If a url includes an anchor, let's scroll this into view!
		if ( typeof window !== 'undefined' && actionUrl.indexOf( '#' ) !== -1 && post?.content ) {
			setTimeout( () => {
				const anchorId = actionUrl.split( '#' ).pop();
				const element = document.getElementById( anchorId );
				if ( element ) {
					element.scrollIntoView();
				}
			}, 0 );
		}
	}, [ actionUrl, post ] );

	return (
		<Dialog
			isVisible
			additionalClassNames="support-article-dialog"
			baseClassName="support-article-dialog__base dialog"
			buttons={ [
				<Button onClick={ closeSupportArticleDialog }>
					{ translate( 'Close', { textOnly: true } ) }
				</Button>,
				actionUrl && (
					<Button
						href={ actionUrl }
						target={ actionIsExternal ? '_blank' : undefined }
						primary
						onClick={ () => ( actionIsExternal ? noop() : closeSupportArticleDialog())  }
					>
						{ actionLabel } { actionIsExternal && <Gridicon icon="external" size={ 12 } /> }
					</Button>
				),
			].filter( Boolean ) }
			onCancel={ closeSupportArticleDialog }
			onClose={ closeSupportArticleDialog }
		>
			<Emojify>
				{ siteId && <QueryReaderSite siteId={ +siteId } /> }
				{ isLoading && <QueryReaderPost postKey={ postKey } /> }
				<article className="support-article-dialog__story">
					<SupportArticleHeader post={ post } isLoading={ isLoading } />
					{ isLoading ? (
						<Placeholders />
					) : (
						/*eslint-disable react/no-danger */
						<EmbedContainer>
							<div
								className="support-article-dialog__story-content"
								dangerouslySetInnerHTML={ { __html: post?.content } }
							/>
						</EmbedContainer>
						/*eslint-enable react/no-danger */
					) }
				</article>
			</Emojify>
		</Dialog>
	);
};

SupportArticleDialog.propTypes = {
	actionIsExternal: PropTypes.bool,
	actionLabel: PropTypes.string,
	actionUrl: PropTypes.string,
	closeSupportArticleDialog: PropTypes.func.isRequired,
	post: PropTypes.object,
	postId: PropTypes.number,
};

const mapStateToProps = ( state ) => {
	const postId = getInlineSupportArticlePostId( state );
	const actionUrl = getInlineSupportArticleActionUrl( state );
	const actionLabel = getInlineSupportArticleActionLabel( state );
	const actionIsExternal = getInlineSupportArticleActionIsExternal( state );
	const post = getPostByKey( state, { blogId: SUPPORT_BLOG_ID, postId } );

	return { post, postId, actionUrl, actionLabel, actionIsExternal };
};

export default connect( mapStateToProps, { closeSupportArticleDialog: closeDialog } )(
	SupportArticleDialog
);
