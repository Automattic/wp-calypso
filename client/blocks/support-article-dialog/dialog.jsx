import { Button, Dialog, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SUPPORT_BLOG_ID } from 'calypso/blocks/inline-help/constants';
import QueryReaderPost from 'calypso/components/data/query-reader-post';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import EmbedContainer from 'calypso/components/embed-container';
import useSupportArticleAlternatesQuery from 'calypso/data/support-article-alternates/use-support-article-alternates-query';
import { useRouteModal } from 'calypso/lib/route-modal';
import { closeSupportArticleDialog } from 'calypso/state/inline-support-article/actions';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getInlineSupportArticleActionIsExternal from 'calypso/state/selectors/get-inline-support-article-action-is-external';
import getInlineSupportArticleActionLabel from 'calypso/state/selectors/get-inline-support-article-action-label';
import getInlineSupportArticleActionUrl from 'calypso/state/selectors/get-inline-support-article-action-url';
import getInlineSupportArticleBlogId from 'calypso/state/selectors/get-inline-support-article-blog-id';
import getInlineSupportArticlePostId from 'calypso/state/selectors/get-inline-support-article-post-id';
import SupportArticleHeader from './header';
import Placeholders from './placeholders';

import './style.scss';
import './content.scss';

const noop = () => {};
const getPostKey = ( blogId, postId ) => ( { blogId, postId } );

const useSupportArticleAlternatePostKey = ( blogId, postId ) => {
	const supportArticleAlternates = useSupportArticleAlternatesQuery( blogId, postId );
	if ( supportArticleAlternates.isLoading ) {
		return null;
	}

	if ( ! supportArticleAlternates.data ) {
		return getPostKey( blogId, postId );
	}

	return getPostKey( supportArticleAlternates.data.blog_id, supportArticleAlternates.data.page_id );
};

export const SupportArticleDialog = () => {
	const translate = useTranslate();
	const { value: supportArticleId, closeModal } = useRouteModal( 'support-article' );
	const actionUrl = useSelector( getInlineSupportArticleActionUrl );
	const actionLabel = useSelector( getInlineSupportArticleActionLabel );
	const actionIsExternal = useSelector( getInlineSupportArticleActionIsExternal );
	const articleUrl = actionUrl ? actionUrl : 'https://support.wordpress.com?p=' + supportArticleId;
	const requestBlogId = useSelector( getInlineSupportArticleBlogId );
	const blogId = requestBlogId ?? SUPPORT_BLOG_ID;
	const currentQueryArgs = useSelector( getCurrentQueryArguments );
	let postId = useSelector( getInlineSupportArticlePostId );
	if ( ! postId ) {
		postId = parseInt( currentQueryArgs?.[ 'support-article' ], 10 );
	}
	const postKey = useSupportArticleAlternatePostKey( blogId, postId );
	const post = useSelector( ( state ) => getPostByKey( state, postKey ) );
	const isLoading = ! post || ! postKey;
	const siteId = post?.site_ID;
	const shouldQueryReaderPost = ! post && postKey;

	useEffect( () => {
		//If a url includes an anchor, let's scroll this into view!
		if ( typeof window !== 'undefined' && articleUrl.indexOf( '#' ) !== -1 && post?.content ) {
			setTimeout( () => {
				const anchorId = articleUrl.split( '#' ).pop();
				const element = document.getElementById( anchorId );
				if ( element ) {
					element.scrollIntoView();
				}
			}, 0 );
		}
	}, [ articleUrl, post ] );

	const dispatch = useDispatch();
	const handleCloseDialog = () => {
		dispatch( closeSupportArticleDialog() );
		closeModal();
	};

	return (
		<Dialog
			isVisible
			additionalClassNames="support-article-dialog"
			baseClassName="support-article-dialog__base dialog"
			buttons={ [
				<Button onClick={ handleCloseDialog }>{ translate( 'Close', { textOnly: true } ) }</Button>,
				<Button
					href={ articleUrl }
					target={ actionIsExternal ? '_blank' : undefined }
					primary
					onClick={ actionIsExternal ? noop : handleCloseDialog }
				>
					{ actionLabel } { actionIsExternal && <Gridicon icon="external" size={ 12 } /> }
				</Button>,
			].filter( Boolean ) }
			onCancel={ handleCloseDialog }
			onClose={ handleCloseDialog }
		>
			{ siteId && <QueryReaderSite siteId={ +siteId } /> }
			{ shouldQueryReaderPost && <QueryReaderPost postKey={ postKey } /> }
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
		</Dialog>
	);
};

export default SupportArticleDialog;
