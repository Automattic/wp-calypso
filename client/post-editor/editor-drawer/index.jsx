/**
 * External dependencies
 */
import React from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import AccordionSection from 'components/accordion/section';
import Gridicon from 'components/gridicon';
import TaxonomiesAccordion from 'post-editor/editor-taxonomies/accordion';
import CategoryListData from 'components/data/category-list-data';
import TagListData from 'components/data/tag-list-data';
import FeaturedImage from 'post-editor/editor-featured-image';
import EditorSharingAccordion from 'post-editor/editor-sharing/accordion';
import FormTextarea from 'components/forms/form-textarea';
import PostFormatsData from 'components/data/post-formats-data';
import PostFormatsAccordion from 'post-editor/editor-post-formats/accordion';
import Location from 'post-editor/editor-location';
import Discussion from 'post-editor/editor-discussion';
import PageParent from 'post-editor/editor-page-parent';
import EditorMoreOptionsSlug from 'post-editor/editor-more-options/slug';
import InfoPopover from 'components/info-popover';
import PageTemplatesData from 'components/data/page-templates-data';
import PageTemplates from 'post-editor/editor-page-templates';
import PageOrder from 'post-editor/editor-page-order';
import PostMetadata from 'lib/post-metadata';
import TrackInputChanges from 'components/track-input-changes';
import actions from 'lib/posts/actions';
import stats from 'lib/posts/stats';
import siteUtils from 'lib/site/utils';
import { setExcerpt } from 'state/ui/editor/post/actions';
import QueryPostTypes from 'components/data/query-post-types';
import { getSelectedSite } from 'state/ui/selectors';
import { getPostTypes } from 'state/post-types/selectors';

const EditorDrawer = React.createClass( {
	propTypes: {
		site: React.PropTypes.object,
		post: React.PropTypes.object,
		postTypes: React.PropTypes.object,
		isNew: React.PropTypes.bool,
		setExcerpt: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			setExcerpt: () => {}
		};
	},

	onExcerptChange: function( event ) {
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		actions.edit( { excerpt: event.target.value } );
		this.props.setExcerpt( event.target.value );
	},

	currentPostTypeSupportsAll: function() {
		// We explicitly hard-code posts as supporting all features, which is a
		// hack that saves us a network request. While technically possible for
		// a theme to remove feature support for posts, this is very rare. If
		// encountered, we should consider removing this shortcut.
		return 'post' === this.props.type;
	},

	currentPostTypeSupports: function( feature ) {
		const { site, postTypes, type } = this.props;
		if ( this.currentPostTypeSupportsAll() ) {
			return true;
		}

		// Default to true until post types are known
		if ( ! site || ! postTypes ) {
			return true;
		}

		return get( postTypes, [ type, 'supports', feature ], false );
	},

	recordExcerptChangeStats: function() {
		stats.recordStat( 'excerpt_changed' );
		stats.recordEvent( 'Changed Excerpt' );
	},

	renderTaxonomies: function() {
		var element;

		if ( ! this.currentPostTypeSupports( 'tags' ) ) {
			return;
		}

		element = (
			<TaxonomiesAccordion
				site={ this.props.site }
				post={ this.props.post } />
		);

		if ( this.props.site ) {
			element = (
				<CategoryListData siteId={ this.props.site.ID }>
					<TagListData siteId={ this.props.site.ID }>
						{ element }
					</TagListData>
				</CategoryListData>
			);
		}

		return element;
	},

	renderPostFormats: function() {
		if ( ! this.props.site || ! this.props.post ) {
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
				post={ this.props.post }
				isNew={ this.props.isNew } />
		);
	},

	renderFeaturedImage: function() {
		return (
			<Accordion
				title={ this.translate( 'Featured Image' ) }
				icon={ <Gridicon icon="image" /> }
			>
				<FeaturedImage
					editable={ true }
					site={ this.props.site }
					post={ this.props.post } />
			</Accordion>
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
		)
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
						slug={ this.props.post ? this.props.post.slug : null }
						type={ this.props.type } />
				) }
				{ this.renderExcerpt() }
				{ this.renderLocation() }
				{ this.renderDiscussion() }
			</Accordion>
		);
	},

	renderPageDrawer: function() {
		return (
			<div>
				{ this.renderTaxonomies() }
				{ this.renderFeaturedImage() }
				<Accordion
					title={ this.translate( 'Page Options' ) }
					icon={ <Gridicon icon="pages" /> }>
					{ this.props.site && this.props.post ?
						<div>
							<PageParent siteId={ this.props.site.ID }
								postId={ this.props.post.ID }
								parent={ this.props.post.parent_id ? this.props.post.parent_id : 0 }
							/>
							<PageTemplatesData siteId={ this.props.site.ID } >
								<PageTemplates post={ this.props.post } />
							</PageTemplatesData>
						</div>
					: null }
					<PageOrder menuOrder={ this.props.post ? this.props.post.menu_order : 0 } />
				</Accordion>
				{ this.renderSharing() }
				{ this.renderMoreOptions() }
			</div>
		);
	},

	renderPostDrawer: function() {
		return (
			<div>
				{ this.renderTaxonomies() }
				{ this.renderFeaturedImage() }
				{ this.renderSharing() }
				{ this.renderPostFormats() }
				{ this.renderMoreOptions() }
			</div>
		);
	},

	render: function() {
		const { site, type } = this.props;

		return (
			<div className="editor-drawer">
				{ site && ! this.currentPostTypeSupportsAll() && (
					<QueryPostTypes siteId={ site.ID } />
				) }
				{ 'page' === type
					? this.renderPageDrawer()
					: this.renderPostDrawer() }
			</div>
		);
	}
} );

export default connect(
	( state ) => {
		const site = getSelectedSite( state );
		if ( ! site ) {
			return {};
		}

		return {
			postTypes: getPostTypes( state, site.ID )
		};
	},
	dispatch => bindActionCreators( { setExcerpt }, dispatch )
)( EditorDrawer );
