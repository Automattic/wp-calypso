/**
 * External dependencies
 */
var React = require( 'react' ),
	find = require( 'lodash/collection/find' );

/**
 * Internal dependencies
 */
var Accordion = require( 'components/accordion' ),
	AccordionSection = require( 'components/accordion/section' ),
	Gridicon = require( 'components/gridicon' ),
	TaxonomiesAccordion = require( 'post-editor/editor-taxonomies/accordion' ),
	CategoryListData = require( 'components/data/category-list-data' ),
	TagListData = require( 'components/data/tag-list-data' ),
	FeaturedImage = require( 'post-editor/editor-featured-image' ),
	EditorSharingContainer = require( 'post-editor/editor-sharing/container' ),
	FormTextarea = require( 'components/forms/form-textarea' ),
	PostFormatsData = require( 'components/data/post-formats-data' ),
	PostFormatsAccordion = require( 'post-editor/editor-post-formats/accordion' ),
	Location = require( 'post-editor/editor-location' ),
	Discussion = require( 'post-editor/editor-discussion' ),
	PageParent = require( 'post-editor/editor-page-parent' ),
	EditorMoreOptionsSlug = require( 'post-editor/editor-more-options/slug' ),
	InfoPopover = require( 'components/info-popover' ),
	PageTemplatesData = require( 'components/data/page-templates-data' ),
	PageTemplates = require( 'post-editor/editor-page-templates' ),
	PageOrder = require( 'post-editor/editor-page-order' ),
	PostMetadata = require( 'lib/post-metadata' ),
	TrackInputChanges = require( 'components/track-input-changes' ),
	actions = require( 'lib/posts/actions' ),
	stats = require( 'lib/posts/stats' ),
	observe = require( 'lib/mixins/data-observe' ),
	siteUtils = require( 'lib/site/utils' ),
	user = require( 'lib/user' )();

var EditorDrawer = React.createClass( {

	propTypes: {
		site: React.PropTypes.object,
		post: React.PropTypes.object,
		postTypes: React.PropTypes.object,
		isNew: React.PropTypes.bool
	},

	mixins: [
		observe( 'postTypes' ),
	],

	onExcerptChange: function( event ) {
		actions.edit( { excerpt: event.target.value } );
	},

	currentPostTypeSupports: function( feature ) {
		if ( ! this.props.site ) {
			return false;
		}

		const types = this.props.postTypes.get( this.props.site.ID );
		const currentType = find( types, { name: this.props.type } );

		// assume positively if we can't determine support
		if ( ! currentType || ! currentType.supports ) {
			return true;
		}

		return currentType.supports[ feature ];
	},

	recordExcerptChangeStats: function() {
		stats.recordStat( 'excerpt_changed' );
		stats.recordEvent( 'Changed Excerpt' );
	},

	renderTaxonomies: function() {
		var element;

		if ( 'post' !== this.props.type && ! this.currentPostTypeSupports( 'tags' ) ) {
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
		const currentUser = user.get();
		if ( ! currentUser ) {
			return null;
		}

		return (
			<EditorSharingContainer currentUserID={ currentUser.ID } />
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

		if ( 'post' !== this.props.type && ! this.currentPostTypeSupports( 'excerpt' ) ) {
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

		if ( 'post' !== this.props.type && ! this.currentPostTypeSupports( 'geo-location' ) ) {
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
		if ( 'post' !== this.props.type && ! this.currentPostTypeSupports( 'comments' ) ) {
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
		if ( 'post' !== this.props.type &&
			! this.currentPostTypeSupports( 'excerpt' ) &&
			! this.currentPostTypeSupports( 'geo-location' ) &&
			! this.currentPostTypeSupports( 'comments' ) &&
			! siteUtils.isPermalinkEditable( this.props.site ) ) {
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
			<div className="editor-drawer">
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
			<div className="editor-drawer">
				{ this.renderTaxonomies() }
				{ this.renderFeaturedImage() }
				{ this.renderSharing() }
				{ this.renderPostFormats() }
				{ this.renderMoreOptions() }
			</div>
		);
	},

	render: function() {
		if ( this.props.type === 'page' ) {
			return this.renderPageDrawer();
		}
		return this.renderPostDrawer();
	}
} );

module.exports = EditorDrawer;
