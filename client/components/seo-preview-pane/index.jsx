import { FEATURE_SEO_PREVIEW_TOOLS } from '@automattic/calypso-products';
import {
	FacebookLinkPreview,
	FacebookPostPreview,
	TwitterLinkPreview,
	GoogleSearchPreview,
	TYPE_WEBSITE,
	TYPE_ARTICLE,
} from '@automattic/social-previews';
import { localize } from 'i18n-calypso';
import { compact, find, get } from 'lodash';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import SeoPreviewUpgradeNudge from 'calypso/components/seo/preview-upgrade-nudge';
import ReaderPreview from 'calypso/components/seo/reader-preview';
import VerticalMenu from 'calypso/components/vertical-menu';
import { SocialItem } from 'calypso/components/vertical-menu/items';
import { parseHtml } from 'calypso/lib/formatting';
import { formatExcerpt } from 'calypso/lib/post-normalizer/rule-create-better-excerpt';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getEditorPostId } from 'calypso/state/editor/selectors';
import { getSitePost } from 'calypso/state/posts/selectors';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSeoTitle } from 'calypso/state/sites/selectors';
import { getSectionName, getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const PREVIEW_IMAGE_WIDTH = 512;

const largeBlavatar = ( site ) => {
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

	return imageUrl ? `${ imageUrl }?s=${ PREVIEW_IMAGE_WIDTH }` : null;
};

const getSeoExcerptForPost = ( post ) => {
	if ( ! post ) {
		return null;
	}

	return formatExcerpt(
		find(
			[
				post.metadata?.find( ( { key } ) => key === 'advanced_seo_description' )?.value,
				post.excerpt,
				post.content,
			],
			Boolean
		)
	);
};

const getSeoExcerptForSite = ( site ) => {
	if ( ! site ) {
		return null;
	}

	return formatExcerpt(
		find(
			[ get( site, 'options.advanced_seo_front_page_description' ), site.description ],
			Boolean
		)
	);
};

const ComingSoonMessage = ( translate ) => (
	<div className="seo-preview-pane__message">{ translate( 'Coming Soon!' ) }</div>
);

const ReaderPost = ( site, post, frontPageMetaDescription ) => {
	return (
		<ReaderPreview
			site={ site }
			post={ post }
			postExcerpt={ formatExcerpt(
				frontPageMetaDescription || get( post, 'excerpt', false ) || get( post, 'content', false )
			) }
			postImage={ getPostImage( post ) }
		/>
	);
};

const GoogleSite = ( site, frontPageMetaDescription ) => (
	<GoogleSearchPreview
		title={ site.name }
		url={ site.URL }
		description={ frontPageMetaDescription || getSeoExcerptForSite( site ) }
		siteTitle={ site.title }
	/>
);

const GooglePost = ( site, post, frontPageMetaDescription ) => (
	<GoogleSearchPreview
		title={ get( post, 'seoTitle', '' ) }
		url={ get( post, 'URL', '' ) }
		description={ frontPageMetaDescription || getSeoExcerptForPost( post ) }
		siteTitle={ site.title }
	/>
);

const FacebookSite = ( site, frontPageMetaDescription ) => (
	<FacebookLinkPreview
		title={ site.name }
		url={ site.URL }
		description={ frontPageMetaDescription || getSeoExcerptForSite( site ) }
		image={ largeBlavatar( site ) }
		type={ TYPE_WEBSITE }
	/>
);

const FacebookPost = ( site, post, frontPageMetaDescription ) => (
	<FacebookPostPreview
		title={ get( post, 'seoTitle', '' ) }
		url={ get( post, 'URL', '' ) }
		description={ frontPageMetaDescription || getSeoExcerptForPost( post ) }
		image={ getPostImage( post ) }
		user={ { displayName: get( post, 'author.name', '' ) } }
		type={ TYPE_ARTICLE }
	/>
);

const TwitterSite = ( site, frontPageMetaDescription ) => (
	<TwitterLinkPreview
		title={ site.name }
		url={ site.URL }
		type="summary"
		description={ frontPageMetaDescription || getSeoExcerptForSite( site ) }
		image={ largeBlavatar( site ) }
	/>
);

const TwitterPost = ( site, post, frontPageMetaDescription ) => (
	<TwitterLinkPreview
		title={ get( post, 'seoTitle', '' ) }
		url={ get( post, 'URL', '' ) }
		type="large_image_summary"
		description={ frontPageMetaDescription || getSeoExcerptForPost( post ) }
		image={ getPostImage( post ) }
	/>
);

export class SeoPreviewPane extends PureComponent {
	constructor( props ) {
		super( props );

		this.state = {
			selectedService: props.post ? 'wordpress' : 'google',
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
		const { post, site, translate, showNudge, frontPageMetaDescription } = this.props;

		const { selectedService } = this.state;

		const services = compact( [ post && 'wordpress', 'google', 'facebook', 'x' ] );

		if ( showNudge ) {
			return <SeoPreviewUpgradeNudge { ...{ site } } />;
		}

		return (
			<div className="seo-preview-pane">
				<div className="seo-preview-pane__sidebar">
					<div className="seo-preview-pane__explanation">
						<h1 className="seo-preview-pane__title">{ translate( 'External previews' ) }</h1>
						<p className="seo-preview-pane__description">
							{ translate(
								"Below you'll find previews that " +
									'represent how your post will look ' +
									"when it's found or shared across a " +
									'variety of networks.'
							) }
						</p>
					</div>
					<VerticalMenu onClick={ this.selectPreview }>
						{ services.map( ( service ) => (
							<SocialItem key={ service } service={ service } />
						) ) }
					</VerticalMenu>
				</div>
				<div className="seo-preview-pane__preview-area">
					<div className="seo-preview-pane__preview">
						{ post &&
							get(
								{
									wordpress: ReaderPost( site, post, frontPageMetaDescription ),
									facebook: FacebookPost( site, post, frontPageMetaDescription ),
									google: GooglePost( site, post, frontPageMetaDescription ),
									x: TwitterPost( site, post, frontPageMetaDescription ),
								},
								selectedService,
								ComingSoonMessage( translate )
							) }
						{ ! post &&
							get(
								{
									facebook: FacebookSite( site, frontPageMetaDescription ),
									google: GoogleSite( site, frontPageMetaDescription ),
									x: TwitterSite( site, frontPageMetaDescription ),
								},
								selectedService,
								ComingSoonMessage( translate )
							) }
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state, { overridePost } ) => {
	const site = getSelectedSite( state );
	const post = overridePost || getSitePost( state, site.ID, getEditorPostId( state ) );
	const isEditorShowing = getSectionName( state ) === 'gutenberg-editor';

	return {
		site: {
			...site,
			name: getSeoTitle( state, 'frontPage', { site } ),
		},
		post: isEditorShowing && {
			...post,
			seoTitle: getSeoTitle( state, 'posts', { site, post } ),
		},
		showNudge: ! siteHasFeature( state, site.ID, FEATURE_SEO_PREVIEW_TOOLS ),
	};
};

const mapDispatchToProps = ( dispatch ) => ( {
	trackPreviewService: ( service ) =>
		dispatch( recordTracksEvent( 'calypso_seo_tools_social_preview', { service } ) ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( SeoPreviewPane ) );
