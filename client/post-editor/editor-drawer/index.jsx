/**
 * External dependencies
 */
import React from 'react';
import includes from 'lodash/includes';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import AccordionSection from 'components/accordion/section';
import Gridicon from 'components/gridicon';
import AsyncLoad from 'components/async-load';
import FormTextarea from 'components/forms/form-textarea';
import PageParent from 'post-editor/editor-page-parent';
import EditorMoreOptionsSlug from 'post-editor/editor-more-options/slug';
import InfoPopover from 'components/info-popover';
import PageTemplatesData from 'components/data/page-templates-data';
import PageTemplates from 'post-editor/editor-page-templates';
import PageOrder from 'post-editor/editor-page-order';
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
import config from 'config';
import EditorDrawerTaxonomies from './taxonomies';

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
		typeObject: React.PropTypes.object,
		isNew: React.PropTypes.bool,
		type: React.PropTypes.string
	},

	onExcerptChange: function( event ) {
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		actions.edit( { excerpt: event.target.value } );
	},

	hasHardCodedPostTypeSupports( type ) {
		return POST_TYPE_SUPPORTS.hasOwnProperty( type );
	},

	currentPostTypeSupports: function( feature ) {
		const { typeObject, type } = this.props;

		if ( typeObject && typeObject.supports ) {
			return !! typeObject.supports[ feature ];
		}

		// Fall back to hard-coded settings if known for type
		if ( this.hasHardCodedPostTypeSupports( type ) ) {
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
		return (
			<EditorDrawerTaxonomies
				postTerms={ this.props.post && this.props.post.terms }
			/>
		);
	},

	renderCategoriesAndTags: function() {
		if ( ! this.currentPostTypeSupports( 'tags' ) ) {
			return;
		}

		return (
			<AsyncLoad
				require={ function( callback ) {
					require( [ 'post-editor/editor-drawer/categories-and-tags' ], callback );
				} }
				site={ this.props.site }
				post={ this.props.post }
			/>
		);
	},

	renderPostFormats: function() {
		if ( ! this.props.site || ! this.props.post ||
				! this.currentPostTypeSupports( 'post-formats' ) ) {
			return;
		}

		return (
			<AsyncLoad
				require={ function( callback ) {
					require( [ 'post-editor/editor-drawer/post-formats' ], callback );
				} }
				site={ this.props.site }
				post={ this.props.post }
			/>
		);
	},

	renderSharing: function() {
		return (
			<AsyncLoad
				require={ function( callback ) {
					require( [ 'post-editor/editor-sharing/accordion' ], callback );
				} }
				site={ this.props.site }
				post={ this.props.post }
				isNew={ this.props.isNew } />
		);
	},

	renderFeaturedImage: function() {
		if ( ! this.currentPostTypeSupports( 'thumbnail' ) ) {
			return;
		}

		return (
			<AsyncLoad
				require={ function( callback ) {
					require( [ './featured-image' ], callback );
				} }
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
				<AsyncLoad
					require={ function( callback ) {
						require( [ 'post-editor/editor-location' ], callback );
					} }
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
					require={ function( callback ) {
						require( [ 'post-editor/editor-discussion' ], callback );
					} }
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
			<AsyncLoad
				require={ function( callback ) {
					require( [ 'post-editor/editor-seo-accordion' ], callback );
				} }
				metaDescription={ PostMetadata.metaDescription( this.props.post ) }
			/>
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

		return (
			<Accordion
				title={ this.translate( 'Page Options' ) }
				icon={ <Gridicon icon="pages" /> }>
				{ this.props.site && this.props.post &&
					<div>
						<PageParent siteId={ this.props.site.ID }
							postId={ this.props.post.ID }
							parent={ this.props.post.parent_id ? this.props.post.parent_id : 0 }
						/>
						<PageTemplatesData siteId={ this.props.site.ID } >
							<PageTemplates post={ this.props.post } />
						</PageTemplatesData>
					</div>
				}
				<PageOrder menuOrder={ this.props.post ? this.props.post.menu_order : 0 } />
			</Accordion>
		);
	},

	render: function() {
		const { site, type } = this.props;

		return (
			<div className="editor-drawer">
				{ site && ! this.hasHardCodedPostTypeSupports( type ) && (
					<QueryPostTypes siteId={ site.ID } />
				) }
				{ config.isEnabled( 'manage/custom-post-types' ) &&	! includes( [ 'post', 'page' ], this.props.type )
					? this.renderTaxonomies()
					: this.renderCategoriesAndTags()
				}
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
			typeObject: getPostType( state, siteId, type )
		};
	},
	null,
	null,
	{ pure: false }
)( EditorDrawer );
