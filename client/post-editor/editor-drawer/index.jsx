/**
 * External dependencies
 */
import React from 'react';
import createFragment from 'react-addons-create-fragment';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import AccordionSection from 'components/accordion/section';
import Gridicon from 'components/gridicon';
import CategoriesTagsAccordion from 'post-editor/editor-categories-tags/accordion';
import CategoryListData from 'components/data/category-list-data';
import TagListData from 'components/data/tag-list-data';
import EditorSharingAccordion from 'post-editor/editor-sharing/accordion';
import FormTextarea from 'components/forms/form-textarea';
import PostFormatsData from 'components/data/post-formats-data';
import PostFormatsAccordion from 'post-editor/editor-post-formats/accordion';
import Location from 'post-editor/editor-location';
import Discussion from 'post-editor/editor-discussion';
import SeoAccordion from 'post-editor/editor-seo-accordion';
import EditorMoreOptionsSlug from 'post-editor/editor-more-options/slug';
import InfoPopover from 'components/info-popover';
import PostMetadata from 'lib/post-metadata';
import TrackInputChanges from 'components/track-input-changes';
import actions from 'lib/posts/actions';
import { recordStat, recordEvent } from 'lib/posts/stats';
import siteUtils from 'lib/site/utils';
import { isBusiness, isEnterprise } from 'lib/products-values';
import QueryPostTypes from 'components/data/query-post-types';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { getPostType } from 'state/post-types/selectors';
import { isJetpackMinimumVersion } from 'state/sites/selectors';
import config from 'config';
import EditorDrawerFeaturedImage from './featured-image';
import EditorDrawerTaxonomies from './taxonomies';
import EditorDrawerPageOptions from './page-options';

/**
 * Constants
 */

/**
 * A mapping of post type to hard-coded post types support. These values are
 * used as fallbacks if the REST API type entity has not been retrieved, and
 * prevent the post type query component from being rendered.
 *
 * @see https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/post-types/
 * @type {Object}
 */
const POST_TYPE_SUPPORTS = {
	post: {
		thumbnail: true,
		excerpt: true,
		'post-formats': true,
		'geo-location': true,
		tags: true,
		comments: true
	},
	page: {
		thumbnail: true,
		'page-attributes': true,
		'geo-location': true,
		excerpt: true,
		comments: true
	}
};

const EditorDrawer = React.createClass( {
	propTypes: {
		site: React.PropTypes.object,
		post: React.PropTypes.object,
		canJetpackUseTaxonomies: React.PropTypes.bool,
		typeObject: React.PropTypes.object,
		isNew: React.PropTypes.bool,
		type: React.PropTypes.string
	},

	onExcerptChange: function( event ) {
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		actions.edit( { excerpt: event.target.value } );
	},

	currentPostTypeSupports: function( feature ) {
		const { typeObject, type } = this.props;

		if ( typeObject && typeObject.supports ) {
			return !! typeObject.supports[ feature ];
		}

		// Fall back to hard-coded settings if known for type
		if ( POST_TYPE_SUPPORTS.hasOwnProperty( type ) ) {
			return !! POST_TYPE_SUPPORTS[ type ][ feature ];
		}

		// Default to true until post types are known
		return true;
	},

	recordExcerptChangeStats: function() {
		recordStat( 'excerpt_changed' );
		recordEvent( 'Changed Excerpt' );
	},

	renderTaxonomies: function() {
		const { type, post, site, canJetpackUseTaxonomies } = this.props;

		// Compatibility: Allow Tags for pages when supported prior to launch
		// of custom post types feature (#6934). [TODO]: Remove after launch.
		const isCustomTypesEnabled = config.isEnabled( 'manage/custom-post-types' );
		const typeSupportsTags = ! isCustomTypesEnabled && this.currentPostTypeSupports( 'tags' );

		// Categories & Tags
		let categories;
		if ( 'post' === type || typeSupportsTags ) {
			categories = (
				<CategoriesTagsAccordion
					site={ site }
					post={ post } />
			);

			if ( site ) {
				categories = (
					<CategoryListData siteId={ site.ID }>
						<TagListData siteId={ site.ID }>
							{ categories }
						</TagListData>
					</CategoryListData>
				);
			}
		}

		// Custom Taxonomies
		let taxonomies;
		if ( isCustomTypesEnabled && false !== canJetpackUseTaxonomies ) {
			taxonomies = <EditorDrawerTaxonomies />;
		}

		return createFragment( { categories, taxonomies } );
	},

	renderPostFormats: function() {
		if ( ! this.props.site || ! this.props.post ||
				! this.currentPostTypeSupports( 'post-formats' ) ) {
			return;
		}

		return (
			<PostFormatsData siteId={ this.props.site.ID }>
				<PostFormatsAccordion
					site={ this.props.site }
					post={ this.props.post }
					className="editor-drawer__accordion" />
			</PostFormatsData>
		);
	},

	renderSharing: function() {
		return (
			<EditorSharingAccordion
				site={ this.props.site }
				post={ this.props.post } />
		);
	},

	renderFeaturedImage: function() {
		if ( ! this.currentPostTypeSupports( 'thumbnail' ) ) {
			return;
		}

		return (
			<EditorDrawerFeaturedImage
				site={ this.props.site }
				post={ this.props.post } />
		);
	},

	renderExcerpt: function() {
		var excerpt;

		if ( ! this.currentPostTypeSupports( 'excerpt' ) ) {
			return;
		}

		if ( this.props.post ) {
			excerpt = this.props.post.excerpt;
		}

		return (
			<AccordionSection>
				<span className="editor-drawer__label-text">
					{ this.translate( 'Excerpt' ) }
					<InfoPopover position="top left">
						{ this.translate( 'Excerpts are optional hand-crafted summaries of your content.' ) }
					</InfoPopover>
				</span>
				<TrackInputChanges onNewValue={ this.recordExcerptChangeStats }>
					<FormTextarea
						id="excerpt"
						name="excerpt"
						onChange={ this.onExcerptChange }
						value={ excerpt }
						placeholder={ this.translate( 'Write an excerpt…' ) }
						aria-label={ this.translate( 'Write an excerpt…' ) }
					/>
				</TrackInputChanges>
			</AccordionSection>
		);
	},

	renderLocation: function() {
		if ( ! this.props.site || this.props.site.jetpack ) {
			return;
		}

		if ( ! this.currentPostTypeSupports( 'geo-location' ) ) {
			return;
		}

		return (
			<AccordionSection>
				<span className="editor-drawer__label-text">{ this.translate( 'Location' ) }</span>
				<Location coordinates={ PostMetadata.geoCoordinates( this.props.post ) } />
			</AccordionSection>
		);
	},

	renderDiscussion: function() {
		if ( ! this.currentPostTypeSupports( 'comments' ) ) {
			return;
		}

		return(
			<AccordionSection>
				<Discussion
					site={ this.props.site }
					post={ this.props.post }
					isNew={ this.props.isNew }
				/>
			</AccordionSection>
		);
	},

	renderSeo: function() {
		if ( ! config.isEnabled( 'manage/advanced-seo' ) || ! this.props.site ) {
			return;
		}

		const { plan } = this.props.site;
		const hasBusinessPlan = isBusiness( plan ) || isEnterprise( plan );
		if ( ! hasBusinessPlan ) {
			return;
		}

		return (
			<SeoAccordion metaDescription={ PostMetadata.metaDescription( this.props.post ) } />
		);
	},

	renderMoreOptions: function() {
		if (
			! this.currentPostTypeSupports( 'excerpt' ) &&
			! this.currentPostTypeSupports( 'geo-location' ) &&
			! this.currentPostTypeSupports( 'comments' ) &&
			! siteUtils.isPermalinkEditable( this.props.site )
		) {
			return;
		}

		return (
			<Accordion
				title={ this.translate( 'More Options' ) }
				icon={ <Gridicon icon="ellipsis" /> }
				className="editor-drawer__more-options"
			>
				{ siteUtils.isPermalinkEditable( this.props.site ) && (
					<EditorMoreOptionsSlug
						slug={ this.props.post ? this.props.post.slug : '' }
						type={ this.props.type } />
				) }
				{ this.renderExcerpt() }
				{ this.renderLocation() }
				{ this.renderDiscussion() }
			</Accordion>
		);
	},

	renderPageOptions() {
		if ( ! this.currentPostTypeSupports( 'page-attributes' ) ) {
			return;
		}

		return <EditorDrawerPageOptions post={ this.props.post } />;
	},

	render: function() {
		const { site, type } = this.props;

		return (
			<div className="editor-drawer">
				{ site && (
					<QueryPostTypes siteId={ site.ID } />
				) }
				{ this.renderTaxonomies() }
				{ this.renderFeaturedImage() }
				{ this.renderPageOptions() }
				{ this.renderSharing() }
				{ this.renderPostFormats() }
				{ this.renderSeo() }
				{ this.renderMoreOptions() }
			</div>
		);
	}
} );

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const type = getEditedPostValue( state, siteId, getEditorPostId( state ), 'type' );

		return {
			canJetpackUseTaxonomies: isJetpackMinimumVersion( state, siteId, '4.1' ),
			typeObject: getPostType( state, siteId, type )
		};
	},
	null,
	null,
	{ pure: false }
)( EditorDrawer );
