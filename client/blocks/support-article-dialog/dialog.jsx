import { Button, Dialog, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { memoize } from 'lodash';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { SUPPORT_BLOG_ID } from 'calypso/blocks/inline-help/constants';
import QueryReaderPost from 'calypso/components/data/query-reader-post';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import QuerySupportArticleAlternates from 'calypso/components/data/query-support-article-alternates';
import EmbedContainer from 'calypso/components/embed-container';
import { isDefaultLocale } from 'calypso/lib/i18n-utils';
import useSearchQueryState from 'calypso/lib/url-search-query-state';
import { closeSupportArticleDialog as closeDialog } from 'calypso/state/inline-support-article/actions';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getInlineSupportArticleActionIsExternal from 'calypso/state/selectors/get-inline-support-article-action-is-external';
import getInlineSupportArticleActionLabel from 'calypso/state/selectors/get-inline-support-article-action-label';
import getInlineSupportArticleActionUrl from 'calypso/state/selectors/get-inline-support-article-action-url';
import getInlineSupportArticleBlogId from 'calypso/state/selectors/get-inline-support-article-blog-id';
import getInlineSupportArticlePostId from 'calypso/state/selectors/get-inline-support-article-post-id';
import {
	getSupportArticleAlternatesForLocale,
	isRequestingSupportArticleAlternates,
	shouldRequestSupportArticleAlternates,
} from 'calypso/state/support-articles-alternates/selectors';
import SupportArticleHeader from './header';
import Placeholders from './placeholders';

import './style.scss';
import './content.scss';

const noop = () => {};

export const SupportArticleDialog = ( {
	actionIsExternal,
	actionLabel,
	actionUrl,
	closeSupportArticleDialog,
	post,
	postId,
	postKey,
	shouldRequestAlternates,
	isRequestingAlternates,
} ) => {
	const translate = useTranslate();
	const isLoading = ! post || isRequestingAlternates;
	const siteId = post?.site_ID;
	const shouldQueryReaderPost = ! post && ! shouldRequestAlternates && ! isRequestingAlternates;
	const [ supportArticle, updateSupportArticle ] = useSearchQueryState( 'support-article' );
	if ( ! actionUrl && supportArticle ) {
		actionUrl = 'https://support.wordpress.com?p=' + supportArticle;
	}

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
	if ( ! postId && supportArticle ) {
		postId = supportArticle;
	}

	const handleCloseDialog = () => {
		closeSupportArticleDialog();
		updateSupportArticle( null );
	};

	return (
		<Dialog
			isVisible
			additionalClassNames="support-article-dialog"
			baseClassName="support-article-dialog__base dialog"
			buttons={ [
				<Button onClick={ handleCloseDialog }>{ translate( 'Close', { textOnly: true } ) }</Button>,
				actionUrl && (
					<Button
						href={ actionUrl }
						target={ actionIsExternal ? '_blank' : undefined }
						primary
						onClick={ () => ( actionIsExternal ? noop() : handleCloseDialog() ) }
					>
						{ actionLabel } { actionIsExternal && <Gridicon icon="external" size={ 12 } /> }
					</Button>
				),
			].filter( Boolean ) }
			onCancel={ handleCloseDialog }
			onClose={ handleCloseDialog }
		>
			{ siteId && <QueryReaderSite siteId={ +siteId } /> }
			{ shouldQueryReaderPost && <QueryReaderPost postKey={ postKey } /> }
			{ shouldRequestAlternates && (
				<QuerySupportArticleAlternates postId={ postId } blogId={ SUPPORT_BLOG_ID } />
			) }
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

SupportArticleDialog.propTypes = {
	actionIsExternal: PropTypes.bool,
	actionLabel: PropTypes.string,
	actionUrl: PropTypes.string,
	closeSupportArticleDialog: PropTypes.func.isRequired,
	post: PropTypes.object,
	postId: PropTypes.number,
};

const getPostKey = memoize(
	( blogId, postId ) => ( { blogId, postId } ),
	( ...args ) => JSON.stringify( args )
);

const mapStateToProps = ( state ) => {
	const postId = getInlineSupportArticlePostId( state );
	const requestBlogId = getInlineSupportArticleBlogId( state );
	const blogId = requestBlogId ?? SUPPORT_BLOG_ID;
	const actionUrl = getInlineSupportArticleActionUrl( state );
	const actionLabel = getInlineSupportArticleActionLabel( state );
	const actionIsExternal = getInlineSupportArticleActionIsExternal( state );

	let postKey = getPostKey( blogId, postId );
	const locale = getCurrentLocaleSlug( state );
	let shouldRequestAlternates =
		! isDefaultLocale( locale ) && shouldRequestSupportArticleAlternates( state, postKey );
	// disable alternates for posts that have a blog ID set
	if ( requestBlogId ) {
		shouldRequestAlternates = false;
	}

	const isRequestingAlternates = isRequestingSupportArticleAlternates( state, postKey );
	const supportArticleAlternates = getSupportArticleAlternatesForLocale( state, postKey, locale );

	if ( supportArticleAlternates ) {
		postKey = getPostKey( supportArticleAlternates.blog_id, supportArticleAlternates.page_id );
	}

	const post = getPostByKey( state, postKey );

	return {
		post,
		postKey,
		postId,
		actionUrl,
		actionLabel,
		actionIsExternal,
		shouldRequestAlternates,
		isRequestingAlternates,
	};
};

export default connect( mapStateToProps, { closeSupportArticleDialog: closeDialog } )(
	SupportArticleDialog
);
