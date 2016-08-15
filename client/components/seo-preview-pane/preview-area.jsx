/** @ssr-ready **/

/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import ReaderPreview from 'components/seo/reader-preview';
import FacebookPreview from 'components/seo/facebook-preview';
import TwitterPreview from 'components/seo/twitter-preview';
import SearchPreview from 'components/seo/search-preview';
import { formatExcerpt } from 'lib/post-normalizer/rule-create-better-excerpt';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getSitePost } from 'state/posts/selectors';
import {
	getSectionName,
	getSelectedSite
} from 'state/ui/selectors';
import {
	largeBlavatar,
	getPostImage,
	getSeoExcerptForSite,
	getSeoExcerptForPost
} from './functions';

const ComingSoonMessage = translate => (
	<div className="seo-preview-pane__message">
		{ translate( 'Coming Soon!' ) }
	</div>
);

const FacebookSite = site => (
	<FacebookPreview
		title={ site.name }
		url={ site.URL }
		type="website"
		description={ getSeoExcerptForSite( site ) }
		image={ largeBlavatar( site ) }
	/>
);

const FacebookPost = ( site, post ) => (
	<FacebookPreview
		title={ post.title }
		url={ post.URL }
		type="article"
		description={ getSeoExcerptForPost( post ) }
		image={ getPostImage( post ) }
		author={ post.author.name }
	/>
);

const GoogleSite = site => (
	<SearchPreview
		title={ site.name }
		url={ site.URL }
		snippet={ getSeoExcerptForSite( site ) }
	/>
);

const GooglePost = ( site, post ) => (
	<SearchPreview
		title={ post.title }
		url={ post.URL }
		snippet={ getSeoExcerptForPost( post ) }
	/>
);

const ReaderPost = ( site, post ) => {
	return (
		<ReaderPreview
			siteTitle={ site.name }
			siteSlug={ site.slug }
			siteIcon={ `${ get( site, 'icon.img', '//gravatar.com/avatar/' ) }?s=32` }
			postTitle={ post.title }
			postExcerpt={ formatExcerpt( post.excerpt || post.content ) }
			postImage={ getPostImage( post ) }
			postDate={ post.date }
			authorName={ post.author.name }
			authorIcon={ post.author.avatar_URL }
		/>
	);
};

const TwitterSite = site => (
	<TwitterPreview
		title={ site.name }
		url={ site.URL }
		type="summary"
		description={ getSeoExcerptForSite( site ) }
		image={ largeBlavatar( site ) }
	/>
);

const TwitterPost = ( site, post ) => (
	<TwitterPreview
		title={ post.title }
		url={ post.URL }
		type="large_image_summary"
		description={ getSeoExcerptForPost( post ) }
		image={ getPostImage( post ) }
	/>
);

const PreviewArea = ( { translate, site, post, selectedService } ) => {
	return (
		<div className="seo-preview-pane__preview-area">
			<div className="seo-preview-pane__preview">
				{ post && get( {
					wordpress: ReaderPost( site, post ),
					facebook: FacebookPost( site, post ),
					google: GooglePost( site, post ),
					twitter: TwitterPost( site, post )
				}, selectedService, ComingSoonMessage( translate ) ) }
				{ ! post && get( {
					facebook: FacebookSite( site ),
					google: GoogleSite( site ),
					twitter: TwitterSite( site )
				}, selectedService, ComingSoonMessage( translate ) ) }
			</div>
		</div>
	);
};

const mapStateToProps = state => {
	const site = getSelectedSite( state );
	const postId = getEditorPostId( state );
	const isEditorShowing = 'post-editor' === getSectionName( state );

	return {
		site: site,
		post: isEditorShowing && getSitePost( state, site.ID, postId )
	};
};

export default connect( mapStateToProps )( localize( PreviewArea ) );
