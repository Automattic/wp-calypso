import { EmbedContainer } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { SupportArticleHeader } from '@automattic/support-articles';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { SUPPORT_BLOG_ID } from 'calypso/blocks/inline-help/constants';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import { usePost } from 'calypso/reader/data/post';
import Placeholders from './placeholders';

import './style.scss';
import './content.scss';

const getPostKey = ( blogId, postId ) => ( { blogId, postId } );

const useSupportArticleAlternatesQuery = ( blogId, postId, locale, queryOptions = {} ) => {
	return useQuery( {
		queryKey: [ 'support-article-alternates', blogId, postId ],
		queryFn: () =>
			wpcomRequest( {
				path: `/support/alternates/${ blogId }/posts/${ postId }`,
				apiVersion: '1.1',
			} ),
		...queryOptions,
		enabled: locale !== 'en' && !! ( blogId && postId ),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		select: ( data ) => {
			return data[ locale ];
		},
	} );
};

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
	const { data: post, isLoading } = usePost( postKey );
	const isArticleLoading = isLoading || ! postKey;
	const siteId = post?.site_ID;

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
			<article className="support-article-dialog__story">
				<SupportArticleHeader post={ post } isLoading={ isArticleLoading } />
				{
					isArticleLoading ? (
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
