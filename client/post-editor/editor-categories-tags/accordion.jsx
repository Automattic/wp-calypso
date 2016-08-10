/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, size, toArray } from 'lodash';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import AccordionSection from 'components/accordion/section';
import EditorDrawerLabel from 'post-editor/editor-drawer/label';
import Gridicon from 'components/gridicon';
import TermSelector from 'post-editor/editor-term-selector';
import QueryTerms from 'components/data/query-terms';
import Tags from 'post-editor/editor-tags';
import InfoPopover from 'components/info-popover';
import unescapeString from 'lodash/unescape';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { getSiteOption } from 'state/sites/selectors';
import { getTerm } from 'state/terms/selectors';

export class EditorCategoriesTagsAccordion extends Component {
	static propTypes = {
		site: PropTypes.object,
		post: PropTypes.object,
		translate: PropTypes.func,
		postTerms: PropTypes.object,
		postType: PropTypes.string,
		defaultCategory: PropTypes.object,
		defaultCategoryId: PropTypes.number,
		// passed down from TagListData
		tags: PropTypes.array,
		tagsHasNextPage: PropTypes.bool,
		tagsFetchingNextPage: PropTypes.bool
	};

	renderCategories() {
		const { translate, postType, defaultCategory, defaultCategoryId, siteId } = this.props;
		if ( postType === 'page' ) {
			return;
		}
		// If the default category is not in the state tree, and is not Uncategorized, fetch via QueryTerms
		const fetchDefaultCategory = defaultCategoryId && defaultCategoryId !== 1 && ( defaultCategory === null );

		return (
			<AccordionSection>
				<EditorDrawerLabel>
					{ translate( 'Categories' ) }
					<InfoPopover position="top left">
						{ translate( 'Use categories to group your posts by topic.' ) }
					</InfoPopover>
				</EditorDrawerLabel>
				{ fetchDefaultCategory &&
					<QueryTerms
						siteId={ siteId }
						taxonomy="category"
						query={ { ID: defaultCategoryId } }
					/>
				}
				<TermSelector taxonomyName="category" />
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
		const categoriesCount = size( categories );

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

		return {
			defaultCategory: getTerm( state, siteId, 'category', defaultCategoryId ),
			postTerms: getEditedPostValue( state, siteId, postId, 'terms' ),
			postType: getEditedPostValue( state, siteId, postId, 'type' ),
			defaultCategoryId,
			siteId,
			postId
		};
	}
)( localize( EditorCategoriesTagsAccordion ) );
