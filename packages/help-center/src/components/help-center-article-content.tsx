/* eslint-disable no-restricted-imports */
import { EmbedContainer } from '@automattic/components';
import { useState, useCallback } from '@wordpress/element';
import { useContentFilter } from '../hooks';
import { ArticleContentProps } from '../types';
import HelpCenterFeedbackForm from './help-center-feedback-form';
import { SupportArticleHeader } from './help-center-support-article-header';
import Placeholders from './placeholder-lines';

const ArticleContent = ( { isLoading = false, post }: ArticleContentProps ) => {
	const [ theRef, setTheRef ] = useState< HTMLDivElement | null >( null );
	const articleContentRef = useCallback( ( node: HTMLDivElement | null ) => setTheRef( node ), [] );

	useContentFilter( theRef );

	return (
		<article className="help-center-article-content">
			{ isLoading || ! post ? (
				<Placeholders lines={ 8 } />
			) : (
				<>
					<SupportArticleHeader post={ post } isLoading={ false } />
					<EmbedContainer>
						<div
							className="help-center-article-content__main"
							// eslint-disable-next-line react/no-danger
							dangerouslySetInnerHTML={ { __html: post.content } }
							ref={ articleContentRef }
						/>
						<HelpCenterFeedbackForm postId={ post.ID } />
					</EmbedContainer>
				</>
			) }
		</article>
	);
};

export default ArticleContent;
