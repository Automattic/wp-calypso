/**
 * External dependencies
 */
import React from 'react';
import createFragment from 'react-addons-create-fragment';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import AccordionSection from 'components/accordion/section';
import CategoriesTagsAccordion from 'post-editor/editor-categories-tags/accordion';
import AsyncLoad from 'components/async-load';
import FormTextarea from 'components/forms/form-textarea';
import EditorMoreOptionsSlug from 'post-editor/editor-more-options/slug';
import PostMetadata from 'lib/post-metadata';
import TrackInputChanges from 'components/track-input-changes';
import actions from 'lib/posts/actions';
import { recordStat, recordEvent } from 'lib/posts/stats';
import { isBusiness, isEnterprise } from 'lib/products-values';
import QueryPostTypes from 'components/data/query-post-types';
import QuerySiteSettings from 'components/data/query-site-settings';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { getPostType } from 'state/post-types/selectors';
import {
	isJetpackMinimumVersion,
	isJetpackModuleActive,
	isJetpackSite,
} from 'state/sites/selectors';
import config from 'config';
import {
	areSitePermalinksEditable,
	isPrivateSite,
	isHiddenSite
} from 'state/selectors';

import EditorDrawerTaxonomies from './taxonomies';
import EditorDrawerPageOptions from './page-options';
import EditorDrawerLabel from './label';
import EditorMoreOptionsCopyPost from 'post-editor/editor-more-options/copy-post';
import EditPostStatus from 'post-editor/edit-post-status';

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
		savedPost: React.PropTypes.object,
		post: React.PropTypes.object,
		canJetpackUseTaxonomies: React.PropTypes.bool,
		typeObject: React.PropTypes.object,
		isNew: React.PropTypes.bool,
		type: React.PropTypes.string,
		setPostDate: React.PropTypes.func,
		onSave: React.PropTypes.func,
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
		const { type, canJetpackUseTaxonomies } = this.props;

		// Compatibility: Allow Tags for pages when supported prior to launch
		// of custom post types feature (#6934). [TODO]: Remove after launch.
		const isCustomTypesEnabled = config.isEnabled( 'manage/custom-post-types' );
		const typeSupportsTags = ! isCustomTypesEnabled && this.currentPostTypeSupports( 'tags' );

		// Categories & Tags
		let categories;
		if ( 'post' === type || typeSupportsTags ) {
			categories = (
				<CategoriesTagsAccordion />
			);
		}

		// Custom Taxonomies
		let taxonomies;
		if ( isCustomTypesEnabled && false !== canJetpackUseTaxonomies ) {
			taxonomies = <EditorDrawerTaxonomies />;
		}

		return createFragment( { categories, taxonomies } );
	},

	renderPostFormats: function() {
		if ( ! this.props.post || ! this.currentPostTypeSupports( 'post-formats' ) ) {
			return;
		}

		return (
			<AsyncLoad
				require="post-editor/editor-post-formats/accordion"
				post={ this.props.post }
				className="editor-drawer__accordion"
			/>
		);
	},

	renderSharing: function() {
		return (
			<AsyncLoad
				require="post-editor/editor-sharing/accordion"
				site={ this.props.site }
				post={ this.props.post } />
		);
	},

	renderFeaturedImage: function() {
		if ( ! this.currentPostTypeSupports( 'thumbnail' ) ) {
			return;
		}

		return (
			<AsyncLoad
				require="./featured-image"
				site={ this.props.site }
				post={ this.props.post }
			/>
		);
	},

	renderExcerpt: function() {
		let excerpt;

		if ( ! this.currentPostTypeSupports( 'excerpt' ) ) {
			return;
		}

		if ( this.props.post ) {
			excerpt = this.props.post.excerpt;
		}

		return (
			<AccordionSection>
				<EditorDrawerLabel
					labelText={ this.translate( 'Excerpt' ) }
					helpText={ this.translate( 'Excerpts are optional hand-crafted summaries of your content.' ) }
				>
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
				</EditorDrawerLabel>
			</AccordionSection>
		);
	},

	renderLocation: function() {
		if ( ! this.props.site || this.props.isJetpack ) {
			return;
		}

		if ( ! this.currentPostTypeSupports( 'geo-location' ) ) {
			return;
		}

		return (
			<AccordionSection>
				<EditorDrawerLabel labelText={ this.translate( 'Location' ) } />
				<AsyncLoad
					require="post-editor/editor-location"
					coordinates={ PostMetadata.geoCoordinates( this.props.post ) }
				/>
			</AccordionSection>
		);
	},

	renderDiscussion: function() {
		if ( ! this.currentPostTypeSupports( 'comments' ) ) {
			return;
		}

		return (
			<AccordionSection>
				<AsyncLoad
					require="post-editor/editor-discussion"
					site={ this.props.site }
					post={ this.props.post }
					isNew={ this.props.isNew }
				/>
			</AccordionSection>
		);
	},

	renderSeo: function() {
		const { jetpackVersionSupportsSeo } = this.props;

		if ( ! this.props.site ) {
			return;
		}

		if ( this.props.isJetpack ) {
			if ( ! this.props.isSeoToolsModuleActive || ! jetpackVersionSupportsSeo ) {
				return;
			}
		}

		const { plan } = this.props.site;
		const hasBusinessPlan = isBusiness( plan ) || isEnterprise( plan );
		const { isPrivate, isHidden } = this.props;

		if ( ! hasBusinessPlan || isPrivate || isHidden ) {
			return;
		}

		return (
			<AsyncLoad
				require="post-editor/editor-seo-accordion"
				metaDescription={ PostMetadata.metaDescription( this.props.post ) }
			/>
		);
	},

	renderCopyPost: function() {
		const { type } = this.props;
		if ( 'post' !== type && 'page' !== type ) {
			return;
		}

		return <EditorMoreOptionsCopyPost type={ type } />;
	},

	renderMoreOptions: function() {
		const { isPermalinkEditable } = this.props;

		if (
			! this.currentPostTypeSupports( 'excerpt' ) &&
			! this.currentPostTypeSupports( 'geo-location' ) &&
			! this.currentPostTypeSupports( 'comments' ) &&
			! isPermalinkEditable
		) {
			return;
		}

		return (
			<Accordion
				title={ this.translate( 'More Options' ) }
				className="editor-drawer__more-options"
			>
				{ isPermalinkEditable && <EditorMoreOptionsSlug /> }
				{ this.renderExcerpt() }
				{ this.renderLocation() }
				{ this.renderDiscussion() }
				{ this.renderCopyPost() }
			</Accordion>
		);
	},

	renderPageOptions() {
		if ( ! this.currentPostTypeSupports( 'page-attributes' ) ) {
			return;
		}

		return <EditorDrawerPageOptions />;
	},

	renderStatus() {
		// TODO: REDUX - remove this logic and prop for EditPostStatus when date is moved to redux
		const postDate = get( this.props.post, 'date', null );
		const postStatus = get( this.props.post, 'status', null );

		return (
			<Accordion title={ this.translate( 'Status' ) }>
				<EditPostStatus
					savedPost={ this.props.savedPost }
					postDate={ postDate }
					type={ this.props.type }
					onSave={ this.props.onSave }
					onTrashingPost={ this.props.onTrashingPost }
					onPrivatePublish={ this.props.onPrivatePublish }
					setPostDate={ this.props.setPostDate }
					site={ this.props.site }
					status={ postStatus }
				/>
			</Accordion>
		);
	},

	render: function() {
		const { site } = this.props;

		return (
			<div className="editor-drawer">
				{ site && (
					<QueryPostTypes siteId={ site.ID } />
				) }
				{ site && (
					<QuerySiteSettings siteId={ site.ID } />
				) }
				{ this.renderStatus() }
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
			isPermalinkEditable: areSitePermalinksEditable( state, siteId ),
			canJetpackUseTaxonomies: isJetpackMinimumVersion( state, siteId, '4.1' ),
			isJetpack: isJetpackSite( state, siteId ),
			isSeoToolsModuleActive: isJetpackModuleActive( state, siteId, 'seo-tools' ),
			jetpackVersionSupportsSeo: isJetpackMinimumVersion( state, siteId, '4.4-beta1' ),
			typeObject: getPostType( state, siteId, type ),
			isPrivate: isPrivateSite( state, siteId ),
			isHidden: isHiddenSite( state, siteId ),
		};
	},
	null,
	null,
	{ pure: false }
)( EditorDrawer );
