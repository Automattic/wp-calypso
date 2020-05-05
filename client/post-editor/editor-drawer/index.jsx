/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flow, overSome } from 'lodash';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import AccordionSection from 'components/accordion/section';
import CategoriesTagsAccordion from 'post-editor/editor-categories-tags/accordion';
import AsyncLoad from 'components/async-load';
import EditorMoreOptionsSlug from 'post-editor/editor-more-options/slug';
import { isBusiness, isEnterprise, isJetpackPremium, isEcommerce } from 'lib/products-values';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import QueryPostTypes from 'components/data/query-post-types';
import QuerySiteSettings from 'components/data/query-site-settings';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { getPostType } from 'state/post-types/selectors';
import { getPlugins, isRequesting } from 'state/plugins/installed/selectors';
import { isJetpackModuleActive, isJetpackSite } from 'state/sites/selectors';
import config from 'config';
import areSitePermalinksEditable from 'state/selectors/are-site-permalinks-editable';
import EditorDrawerTaxonomies from './taxonomies';
import EditorDrawerPageOptions from './page-options';
import EditorDrawerLabel from './label';
import EditorMoreOptionsCopyPost from 'post-editor/editor-more-options/copy-post';
import EditPostStatus from 'post-editor/edit-post-status';
import EditorExcerpt from 'post-editor/editor-excerpt';
import { getFirstConflictingPlugin } from 'lib/seo';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Constants
 */
const hasSupportingPlan = overSome( isBusiness, isEnterprise, isJetpackPremium, isEcommerce );

/**
 * A mapping of post type to hard-coded post types support. These values are
 * used as fallbacks if the REST API type entity has not been retrieved, and
 * prevent the post type query component from being rendered.
 *
 * @see https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/post-types/
 * @type {object}
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
		typeObject: PropTypes.object,
		type: PropTypes.string,
		setPostDate: PropTypes.func,
		onSave: PropTypes.func,
		confirmationSidebarStatus: PropTypes.string,
	};

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
		const isCustomTypesEnabled = config.isEnabled( 'manage/custom-post-types' );

		if ( isCustomTypesEnabled ) {
			return <EditorDrawerTaxonomies />;
		}
	}

	renderPostFormats() {
		if ( ! this.currentPostTypeSupports( 'post-formats' ) ) {
			return;
		}

		return <AsyncLoad require="post-editor/editor-post-formats/accordion" />;
	}

	renderSharing() {
		return <AsyncLoad require="post-editor/editor-sharing/accordion" />;
	}

	renderFeaturedImage() {
		if ( ! this.currentPostTypeSupports( 'thumbnail' ) ) {
			return;
		}

		return <AsyncLoad require="./featured-image" />;
	}

	renderExcerpt() {
		const { translate } = this.props;

		if ( ! this.currentPostTypeSupports( 'excerpt' ) ) {
			return;
		}

		return (
			<AccordionSection>
				<EditorDrawerLabel
					labelText={ translate( 'Excerpt' ) }
					helpText={ translate(
						'An excerpt is a short summary you can add to your posts. ' +
							"Some themes show excerpts alongside post titles on your site's homepage and archive pages."
					) }
				/>
				<EditorExcerpt />
			</AccordionSection>
		);
	}

	renderLocation() {
		const { translate } = this.props;

		if ( ! this.props.site ) {
			return;
		}

		if ( ! this.currentPostTypeSupports( 'geo-location' ) ) {
			return;
		}

		return (
			<AccordionSection>
				<EditorDrawerLabel labelText={ translate( 'Location' ) } />
				<AsyncLoad require="post-editor/editor-location" />
			</AccordionSection>
		);
	}

	renderDiscussion() {
		if ( ! this.currentPostTypeSupports( 'comments' ) ) {
			return;
		}

		return (
			<AccordionSection>
				<AsyncLoad require="post-editor/editor-discussion" />
			</AccordionSection>
		);
	}

	renderSeo() {
		const {
			hasConflictingSeoPlugins,
			isSeoToolsModuleActive,
			isJetpack,
			isRequestingPlugins,
			site,
		} = this.props;

		if ( ! site ) {
			return;
		}

		if ( isJetpack ) {
			if (
				isRequestingPlugins ||
				! isSeoToolsModuleActive ||
				// Hide SEO accordion if this setting is managed by another SEO plugin.
				hasConflictingSeoPlugins
			) {
				return;
			}
		}

		if ( ! hasSupportingPlan( site.plan ) ) {
			return;
		}

		return <AsyncLoad require="post-editor/editor-seo-accordion" />;
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
		const { translate } = this.props;

		return (
			<Accordion title={ translate( 'Status' ) } e2eTitle="status">
				<EditPostStatus
					onSave={ this.props.onSave }
					onPrivatePublish={ this.props.onPrivatePublish }
					setPostDate={ this.props.setPostDate }
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
				{ site && <QueryJetpackPlugins siteIds={ [ site.ID ] } /> }
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
	connect( ( state ) => {
		const siteId = getSelectedSiteId( state );
		const type = getEditedPostValue( state, siteId, getEditorPostId( state ), 'type' );
		const activePlugins = getPlugins( state, [ siteId ], 'active' );

		return {
			hasConflictingSeoPlugins: !! getFirstConflictingPlugin( activePlugins ),
			isPermalinkEditable: areSitePermalinksEditable( state, siteId ),
			isJetpack: isJetpackSite( state, siteId ),
			isSeoToolsModuleActive: isJetpackModuleActive( state, siteId, 'seo-tools' ),
			isRequestingPlugins: isRequesting( state, siteId ),
			type,
			typeObject: getPostType( state, siteId, type ),
		};
	} )
);

export default enhance( EditorDrawer );
