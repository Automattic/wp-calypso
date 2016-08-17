/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, toArray } from 'lodash';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import AccordionSection from 'components/accordion/section';
import EditorDrawerLabel from 'post-editor/editor-drawer/label';
import Gridicon from 'components/gridicon';
import TermSelector from 'post-editor/editor-term-selector';
import Tags from 'post-editor/editor-tags';
import unescapeString from 'lodash/unescape';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { addSiteFragment } from 'lib/route';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { getSiteOption, isJetpackMinimumVersion, getSiteSlug } from 'state/sites/selectors';
import { getTerm } from 'state/terms/selectors';

export class EditorCategoriesTagsAccordion extends Component {
	static propTypes = {
		site: PropTypes.object,
		post: PropTypes.object,
		translate: PropTypes.func,
		postTerms: PropTypes.object,
		postType: PropTypes.string,
		defaultCategory: PropTypes.object,
		isTermsSupported: PropTypes.bool,
		siteSlug: PropTypes.string,
		// passed down from TagListData
		tags: PropTypes.array,
		tagsHasNextPage: PropTypes.bool,
		tagsFetchingNextPage: PropTypes.bool
	};

	renderJetpackNotice() {
		const { translate, siteSlug } = this.props;
		return (
			<Notice status="is-warning" showDismiss={ false } isCompact>
				{ translate( 'You must update Jetpack to use this feature.' ) }
				<NoticeAction href={ addSiteFragment( '/plugins/jetpack', siteSlug ) }>
					{ translate( 'Update Now' ) }
				</NoticeAction>
			</Notice>
		);
	}

	renderCategories() {
		const { translate, postType, isTermsSupported } = this.props;
		if ( postType === 'page' ) {
			return;
		}

		return (
			<AccordionSection>
				<EditorDrawerLabel
					helpText={ translate( 'Use categories to group your posts by topic.' ) }
					labelText={ translate( 'Categories' ) } />
				{ isTermsSupported
					? <TermSelector taxonomyName="category" />
					: this.renderJetpackNotice()
				}
			</AccordionSection>
		);
	}

	renderTags() {
		return (
			<AccordionSection>
				<Tags
					post={ this.props.post }
					tags={ this.props.tags }
					tagsHasNextPage={ this.props.tagsHasNextPage }
					tagsFetchingNextPage={ this.props.tagsFetchingNextPage }
				/>
			</AccordionSection>
		);
	}

	getCategoriesSubtitle() {
		const { translate, postTerms, defaultCategory } = this.props;
		const categories = toArray( get( postTerms, 'category' ) );
		const categoriesCount = categories.length;

		switch ( categoriesCount ) {
			case 0:
				return defaultCategory ? defaultCategory.name : null;
			case 1:
				return unescapeString( categories[ 0 ].name );
			default:
				return translate(
					'%d category',
					'%d categories',
					{ args: [ categoriesCount ], count: categoriesCount }
				);
		}
	}

	getTagsSubtitle() {
		const { translate } = this.props;
		let tags = this.props.post.tags || [];
		tags = Array.isArray( tags ) ? tags : Object.keys( tags );
		tags = tags.map( unescapeString );

		switch ( tags.length ) {
			case 0:
				return null; // No tags subtitle
			case 1:
				return '#' + tags[ 0 ];
			case 2:
				return '#' + tags[ 0 ] + ', #' + tags[ 1 ];
			default:
				return translate(
					'%d tag',
					'%d tags',
					{ args: [ tags.length ], count: tags.length }
				);
		}
	}

	getSubtitle() {
		const subtitlePieces = [];
		const { postType, site, post } = this.props;

		if ( ! site || ! post ) {
			return null;
		}

		if ( postType === 'post' ) {
			const categoriesSubtitle = this.getCategoriesSubtitle();
			if ( categoriesSubtitle ) {
				subtitlePieces.push( categoriesSubtitle );
			}
		}

		const tagsSubtitle = this.getTagsSubtitle();
		if ( tagsSubtitle ) {
			subtitlePieces.push( tagsSubtitle );
		}

		return subtitlePieces.join( ', ' );
	}

	getTitle() {
		const { translate, postType } = this.props;
		let title;
		if ( postType === 'page' ) {
			title = translate( 'Tags' );
		} else {
			title = translate( 'Categories & Tags' );
		}
		return title;
	}

	render() {
		const classes = classNames(
			'editor-drawer__accordion',
			'editor-categories-tags__accordion',
			this.props.className
		);

		return (
			<Accordion
				title={ this.getTitle() }
				subtitle={ this.getSubtitle() }
				icon={ <Gridicon icon="tag" /> }
				className={ classes }
			>
				{ this.renderCategories() }
				{ this.renderTags() }
			</Accordion>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const defaultCategoryId = getSiteOption( state, siteId, 'default_category' );
		const isTermsSupported = false !== isJetpackMinimumVersion( state, siteId, '4.1.0' );

		return {
			defaultCategory: getTerm( state, siteId, 'category', defaultCategoryId ),
			postTerms: getEditedPostValue( state, siteId, postId, 'terms' ),
			postType: getEditedPostValue( state, siteId, postId, 'type' ),
			siteSlug: getSiteSlug( state, siteId ),
			siteId,
			postId,
			isTermsSupported,
		};
	}
)( localize( EditorCategoriesTagsAccordion ) );
