/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import {
	compact,
	find,
	get,
	identity,
	overSome
} from 'lodash';

/**
 * Internal dependencies
 */
import SeoPreviewUpgradeNudge from 'components/seo/preview-upgrade-nudge';
import ReaderPreview from 'components/seo/reader-preview';
import FacebookPreview from 'components/seo/facebook-preview';
import TwitterPreview from 'components/seo/twitter-preview';
import SearchPreview from 'components/seo/search-preview';
import VerticalMenu from 'components/vertical-menu';
import PostMetadata from 'lib/post-metadata';
import { formatExcerpt } from 'lib/post-normalizer/rule-create-better-excerpt';
import { isBusiness, isEnterprise } from 'lib/products-values';
import { parseHtml } from 'lib/formatting';
import { SocialItem } from 'components/vertical-menu/items';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getSitePost } from 'state/posts/selectors';
import { getSeoTitle } from 'state/sites/selectors';
import {
	getSectionName,
	getSelectedSite
} from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

const PREVIEW_IMAGE_WIDTH = 512;
const hasBusinessPlan = overSome( isBusiness, isEnterprise );

const largeBlavatar = site => {
	const siteIcon = get( site, 'icon.img' );
	if ( ! siteIcon ) {
		return null;
	}

	return `${ siteIcon }?s=${ PREVIEW_IMAGE_WIDTH }`;
};

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
		get( site, 'options.advanced_seo_front_page_description' ),
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
			site={ site }
			post={ post }
			postExcerpt={ formatExcerpt(
				get( post, 'excerpt', false ) ||
				get( post, 'content', false )
			) }
			postImage={ getPostImage( post ) }
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
		title={ get( post, 'seoTitle', '' ) }
		url={ get( post, 'URL', '' ) }
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
		title={ get( post, 'seoTitle', '' ) }
		url={ get( post, 'URL', '' ) }
		type="article"
		description={ getSeoExcerptForPost( post ) }
		image={ getPostImage( post ) }
		author={ get( post, 'author.name', '' ) }
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
		title={ get( post, 'seoTitle', '' ) }
		url={ get( post, 'URL', '' ) }
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

	componentDidMount() {
		// Track the first service that is viewed
		const { trackPreviewService } = this.props;
		const { selectedService } = this.state;

		trackPreviewService( selectedService );
	}

	selectPreview( selectedService ) {
		this.setState( { selectedService } );

		const { trackPreviewService } = this.props;
		trackPreviewService( selectedService );
	}

	render() {
		const {
			post,
			site,
			translate,
			showNudge
		} = this.props;

		const { selectedService } = this.state;

		const services = compact( [
			post && 'wordpress',
			'google',
			'facebook',
			'twitter'
		] );

		if ( showNudge ) {
			return (
				<SeoPreviewUpgradeNudge { ...{ site } } />
			);
		}

		return (
			<div className="seo-preview-pane">
				<div className="seo-preview-pane__sidebar">
					<div className="seo-preview-pane__explanation">
						<h1 className="seo-preview-pane__title">
							{ translate( 'External previews' ) }
						</h1>
						<p className="seo-preview-pane__description">
							{ translate(
								`Below you'll find previews that ` +
								`represent how your post will look ` +
								`when it's found or shared across a ` +
								`variety of networks.`
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
			seoTitle: getSeoTitle( state, 'posts', { site, post } )
		},
		showNudge: site && site.plan && ! hasBusinessPlan( site.plan )
	};
};

const mapDispatchToProps = dispatch => ( {
	trackPreviewService: service => dispatch( recordTracksEvent( 'calypso_seo_tools_social_preview', { service } ) )
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( SeoPreviewPane ) );
