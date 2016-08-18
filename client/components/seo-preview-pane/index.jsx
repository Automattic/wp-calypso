/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import PureComponent from 'react-pure-render/component';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import {
	compact,
	find,
	get,
	identity
} from 'lodash';

/**
 * Internal dependencies
 */
import ReaderPreview from 'components/seo/reader-preview';
import FacebookPreview from 'components/seo/facebook-preview';
import TwitterPreview from 'components/seo/twitter-preview';
import SearchPreview from 'components/seo/search-preview';
import VerticalMenu from 'components/vertical-menu';
import PostMetadata from 'lib/post-metadata';
import { formatExcerpt } from 'lib/post-normalizer/rule-create-better-excerpt';
import { parseHtml } from 'lib/formatting';
import { SocialItem } from 'components/vertical-menu/items';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getSitePost } from 'state/posts/selectors';
import { getSeoTitle } from 'state/sites/selectors';
import {
	getSectionName,
	getSelectedSite
} from 'state/ui/selectors';

const PREVIEW_IMAGE_WIDTH = 512;
const largeBlavatar = site => `${ get( site, 'icon.img', '//gravatar.com/avatar/' ) }?s=${ PREVIEW_IMAGE_WIDTH }`;

const getPostImage = ( post ) => {
	if ( ! post ) {
		return null;
	}

	// Use the featured image if one was set
	if ( post.featured_image ) {
		return post.featured_image;
	}

	// Otherwise we'll look for a large enough image in the post
	const content = post.content;
	if ( ! content ) {
		return null;
	}

	const imgElements = parseHtml( content ).querySelectorAll( 'img' );
	const imageUrl = get(
		find( imgElements, ( { width } ) => width >= PREVIEW_IMAGE_WIDTH ),
		'src',
		null
	);

	return imageUrl
		? `${ imageUrl }?s=${ PREVIEW_IMAGE_WIDTH }`
		: null;
};

const getSeoExcerptForPost = ( post ) => {
	if ( ! post ) {
		return null;
	}

	return formatExcerpt( find( [
		PostMetadata.metaDescription( post ),
		post.excerpt,
		post.content
	], identity ) );
};

const getSeoExcerptForSite = ( site ) => {
	if ( ! site ) {
		return null;
	}

	return formatExcerpt( find( [
		get( site, 'options.seo_meta_description' ),
		site.description
	], identity ) );
};

const ComingSoonMessage = translate => (
	<div className="seo-preview-pane__message">
		{ translate( 'Coming Soon!' ) }
	</div>
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

export class SeoPreviewPane extends PureComponent {
	constructor( props ) {
		super( props );

		this.state = {
			selectedService: props.post ? 'wordpress' : 'google'
		};

		this.selectPreview = this.selectPreview.bind( this );
	}

	selectPreview( selectedService ) {
		this.setState( { selectedService } );
	}

	render() {
		const {
			post,
			site,
			translate
		} = this.props;

		const { selectedService } = this.state;

		const services = compact( [
			post && 'wordpress',
			'google',
			'facebook',
			'twitter'
		] );

		return (
			<div className="seo-preview-pane">
				<div className="seo-preview-pane__sidebar">
					<div className="seo-preview-pane__explanation">
						<h1 className="seo-preview-pane__title">
							{ translate( 'External previews' ) }
						</h1>
						<p className="seo-preview-pane__description">
							{ translate(
								"Below you'll find previews that represent how your post will look " +
								"when it's found or shared across a variety of networks."
							) }
						</p>
					</div>
					<VerticalMenu onClick={ this.selectPreview }>
						{ services.map( service => <SocialItem { ...{ key: service, service } } /> ) }
					</VerticalMenu>
				</div>
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
			</div>
		);
	}
}

const mapStateToProps = state => {
	const site = getSelectedSite( state );
	const postId = getEditorPostId( state );
	const post = getSitePost( state, site.ID, postId );
	const isEditorShowing = 'post-editor' === getSectionName( state );

	return {
		site: {
			...site,
			name: getSeoTitle( state, 'frontPage', { site } )
		},
		post: isEditorShowing && {
			...post,
			title: getSeoTitle( state, 'posts', { site, post } )
		}
	};
};

export default connect( mapStateToProps, null )( localize( SeoPreviewPane ) );
