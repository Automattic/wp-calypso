import { EmbedContainer } from '@automattic/components';
import { SupportArticleHeader } from '@automattic/help-center/src/components/help-center-support-article-header';
import { useSupportArticleAlternatesQuery } from '@automattic/help-center/src/hooks/use-support-article-alternates-query';
import { useLocale } from '@automattic/i18n-utils';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { SUPPORT_BLOG_ID } from 'calypso/blocks/inline-help/constants';
import QueryReaderPost from 'calypso/components/data/query-reader-post';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import Placeholders from './placeholders';

import './style.scss';
import './content.scss';

const getPostKey = ( blogId, postId ) => ( { blogId, postId } );

const useSupportArticleAlternatePostKey = ( blogId, postId ) => {
	const locale = useLocale();
	const supportArticleAlternates = useSupportArticleAlternatesQuery( blogId, postId, locale );
	if ( supportArticleAlternates.isInitialLoading ) {
		return null;
	}

	if ( ! supportArticleAlternates.data ) {
		return getPostKey( blogId, postId );
	}

	return getPostKey( supportArticleAlternates.data.blog_id, supportArticleAlternates.data.page_id );
};

const DialogContent = ( { postId, blogId, articleUrl } ) => {
	const postKey = useSupportArticleAlternatePostKey( blogId ?? SUPPORT_BLOG_ID, postId );
	const post = useSelector( ( state ) => getPostByKey( state, postKey ) );
	const isLoading = ! post || ! postKey;
	const siteId = post?.site_ID;
	const shouldQueryReaderPost = ! post && postKey;

	useEffect( () => {
		//If a url includes an anchor, let's scroll this into view!
		if (
			typeof window !== 'undefined' &&
			articleUrl &&
			articleUrl.indexOf( '#' ) !== -1 &&
			post?.content
		) {
			setTimeout( () => {
				const anchorId = articleUrl.split( '#' ).pop();
				const element = document.getElementById( anchorId );
				if ( element ) {
					element.scrollIntoView();
				}
			}, 0 );
		}
	}, [ articleUrl, post ] );

	return (
		<>
			{ siteId && <QueryReaderSite siteId={ +siteId } /> }
			{ shouldQueryReaderPost && <QueryReaderPost postKey={ postKey } /> }
			<article className="support-article-dialog__story">
				<SupportArticleHeader post={ post } isLoading={ isLoading } />
				{
					isLoading ? (
						<Placeholders />
					) : (
						/*eslint-disable react/no-danger */

						<EmbedContainer>
							<div
								className="support-article-dialog__story-content"
								dangerouslySetInnerHTML={ { __html: post?.content } }
							/>
						</EmbedContainer>
					)
					/*eslint-enable react/no-danger */
				}
			</article>
		</>
	);
};

DialogContent.propTypes = {
	postId: PropTypes.number.isRequired,
	blogId: PropTypes.number,
	articleUrl: PropTypes.string,
};

export default DialogContent;
