/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flow, get } from 'lodash';

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
import { areSitePermalinksEditable } from 'state/selectors';
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
		comments: true,
	},
	page: {
		thumbnail: true,
		'page-attributes': true,
		'geo-location': true,
		excerpt: true,
		comments: true,
	},
};

class EditorDrawer extends Component {
	static propTypes = {
		site: PropTypes.object,
		savedPost: PropTypes.object,
		post: PropTypes.object,
		canJetpackUseTaxonomies: PropTypes.bool,
		typeObject: PropTypes.object,
		isNew: PropTypes.bool,
		type: PropTypes.string,
		setPostDate: PropTypes.func,
		onSave: PropTypes.func,
		isPostPrivate: PropTypes.bool,
		confirmationSidebarStatus: PropTypes.string,
	};

	onExcerptChange( event ) {
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		actions.edit( { excerpt: event.target.value } );
	}

	currentPostTypeSupports( feature ) {
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
	}

	recordExcerptChangeStats() {
		recordStat( 'excerpt_changed' );
		recordEvent( 'Changed Excerpt' );
	}

	// Categories & Tags
	renderCategories() {
		const { type } = this.props;

		// Compatibility: Allow Tags for pages when supported prior to launch
		// of custom post types feature (#6934). [TODO]: Remove after launch.
		const isCustomTypesEnabled = config.isEnabled( 'manage/custom-post-types' );
		const typeSupportsTags = ! isCustomTypesEnabled && this.currentPostTypeSupports( 'tags' );

		if ( 'post' === type || typeSupportsTags ) {
			return <CategoriesTagsAccordion />;
		}
	}

	// Custom Taxonomies
	renderTaxonomies() {
		const { canJetpackUseTaxonomies } = this.props;
		const isCustomTypesEnabled = config.isEnabled( 'manage/custom-post-types' );

		if ( isCustomTypesEnabled && false !== canJetpackUseTaxonomies ) {
			return <EditorDrawerTaxonomies />;
		}
	}

	renderPostFormats() {
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
	}

	renderSharing() {
		return (
			<AsyncLoad
				require="post-editor/editor-sharing/accordion"
				site={ this.props.site }
				post={ this.props.post }
			/>
		);
	}

	renderFeaturedImage() {
		if ( ! this.currentPostTypeSupports( 'thumbnail' ) ) {
			return;
		}

		return (
			<AsyncLoad require="./featured-image" site={ this.props.site } post={ this.props.post } />
		);
	}

	renderExcerpt() {
		const { translate } = this.props;

		if ( ! this.currentPostTypeSupports( 'excerpt' ) ) {
			return;
		}

		const excerpt = get( this.props.post, 'excerpt' );

		return (
			<AccordionSection>
				<EditorDrawerLabel
					labelText={ translate( 'Excerpt' ) }
					helpText={ translate( 'Excerpts are optional hand-crafted summaries of your content.' ) }
				>
					<TrackInputChanges onNewValue={ this.recordExcerptChangeStats }>
						<FormTextarea
							id="excerpt"
							name="excerpt"
							onChange={ this.onExcerptChange }
							value={ excerpt }
							placeholder={ translate( 'Write an excerpt…' ) }
							aria-label={ translate( 'Write an excerpt…' ) }
						/>
					</TrackInputChanges>
				</EditorDrawerLabel>
			</AccordionSection>
		);
	}

	renderLocation() {
		const { translate } = this.props;

		if ( ! this.props.site || this.props.isJetpack ) {
			return;
		}

		if ( ! this.currentPostTypeSupports( 'geo-location' ) ) {
			return;
		}

		return (
			<AccordionSection>
				<EditorDrawerLabel labelText={ translate( 'Location' ) } />
				<AsyncLoad
					require="post-editor/editor-location"
					coordinates={ PostMetadata.geoCoordinates( this.props.post ) }
				/>
			</AccordionSection>
		);
	}

	renderDiscussion() {
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
	}

	renderSeo() {
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

		if ( ! hasBusinessPlan ) {
			return;
		}

		return (
			<AsyncLoad
				require="post-editor/editor-seo-accordion"
				metaDescription={ PostMetadata.metaDescription( this.props.post ) }
			/>
		);
	}

	renderCopyPost() {
		const { type } = this.props;
		if ( 'post' !== type && 'page' !== type ) {
			return;
		}

		return <EditorMoreOptionsCopyPost />;
	}

	renderMoreOptions() {
		const { isPermalinkEditable, translate } = this.props;

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
				title={ translate( 'More Options' ) }
				className="editor-drawer__more-options"
				e2eTitle="more-options"
			>
				{ isPermalinkEditable && <EditorMoreOptionsSlug /> }
				{ this.renderExcerpt() }
				{ this.renderLocation() }
				{ this.renderDiscussion() }
				{ this.renderCopyPost() }
			</Accordion>
		);
	}

	renderPageOptions() {
		if ( ! this.currentPostTypeSupports( 'page-attributes' ) ) {
			return;
		}

		return <EditorDrawerPageOptions />;
	}

	renderStatus() {
		// TODO: REDUX - remove this logic and prop for EditPostStatus when date is moved to redux
		const postDate = get( this.props.post, 'date', null );
		const postStatus = get( this.props.post, 'status', null );
		const { translate, type } = this.props;

		return (
			<Accordion title={ translate( 'Status' ) } e2eTitle="status">
				<EditPostStatus
					savedPost={ this.props.savedPost }
					postDate={ postDate }
					onSave={ this.props.onSave }
					onTrashingPost={ this.props.onTrashingPost }
					onPrivatePublish={ this.props.onPrivatePublish }
					setPostDate={ this.props.setPostDate }
					site={ this.props.site }
					status={ postStatus }
					type={ type }
					isPostPrivate={ this.props.isPostPrivate }
					confirmationSidebarStatus={ this.props.confirmationSidebarStatus }
				/>
			</Accordion>
		);
	}

	render() {
		const { site } = this.props;

		return (
			<div className="editor-drawer">
				{ site && <QueryPostTypes siteId={ site.ID } /> }
				{ site && <QuerySiteSettings siteId={ site.ID } /> }
				{ this.renderStatus() }
				{ this.renderCategories() }
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
}

EditorDrawer.displayName = 'EditorDrawer';

const enhance = flow(
	localize,
	connect(
		state => {
			const siteId = getSelectedSiteId( state );
			const type = getEditedPostValue( state, siteId, getEditorPostId( state ), 'type' );

			return {
				isPermalinkEditable: areSitePermalinksEditable( state, siteId ),
				canJetpackUseTaxonomies: isJetpackMinimumVersion( state, siteId, '4.1' ),
				isJetpack: isJetpackSite( state, siteId ),
				isSeoToolsModuleActive: isJetpackModuleActive( state, siteId, 'seo-tools' ),
				jetpackVersionSupportsSeo: isJetpackMinimumVersion( state, siteId, '4.4-beta1' ),
				type,
				typeObject: getPostType( state, siteId, type ),
			};
		},
		null,
		null,
		{ pure: false }
	)
);

export default enhance( EditorDrawer );
