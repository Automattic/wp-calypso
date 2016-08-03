/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, map, size } from 'lodash';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import AccordionSection from 'components/accordion/section';
import Gridicon from 'components/gridicon';
import TermSelector from 'post-editor/editor-term-selector';
import Tags from 'post-editor/editor-tags';
import InfoPopover from 'components/info-popover';
import unescapeString from 'lodash/unescape';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { getSiteOption } from 'state/sites/selectors';
import { getTerm } from 'state/terms/selectors';

class EditorCategoriesTagsAccordion extends Component {
	static propTypes = {
		site: PropTypes.object,
		post: PropTypes.object,
		translate: PropTypes.func,
		postTerms: PropTypes.object,
		postType: PropTypes.string,
		defaultCategory: PropTypes.object,
		// passed down from TagListData
		tags: PropTypes.array,
		tagsHasNextPage: PropTypes.bool,
		tagsFetchingNextPage: PropTypes.bool
	};

	isLoading() {
		return ! this.props.site || ! this.props.post;
	}

	renderCategories() {
		const { translate, postType } = this.props;
		if ( postType === 'page' ) {
			return;
		}

		return (
			<AccordionSection>
				<label className="editor-drawer__label">
					<span className="editor-drawer__label-text">
						{ translate( 'Categories' ) }
						<InfoPopover position="top left">
							{ translate( 'Use categories to group your posts by topic.' ) }
						</InfoPopover>
					</span>
				</label>
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
		const categories = get( postTerms, 'category' );

		const categoryNames = map( categories, ( category ) => {
			return unescapeString( category.name );
		} );
		const categoryNamesCount = size( categoryNames );

		switch ( categoryNamesCount ) {
			case 0:
				return defaultCategory ? defaultCategory.name : null;
			case 1:
				return categoryNames[ 0 ];
			default:
				return translate(
					'%d category',
					'%d categories',
					{ args: [ categoryNamesCount ], count: categoryNamesCount }
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
				return '#' + tags[0];
			case 2:
				return '#' + tags[0] + ', #' + tags[1];
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
		const { translate, postType } = this.props;
		const isPost = postType === 'post';

		if ( this.isLoading() ) {
			return null;
		}

		if ( isPost ) {
			const categoriesSubtitle = this.getCategoriesSubtitle();
			if ( categoriesSubtitle ) {
				subtitlePieces.push( categoriesSubtitle );
			}
		}

		const tagsSubtitle = this.getTagsSubtitle();
		if ( tagsSubtitle ) {
			subtitlePieces.push( tagsSubtitle );
		}

		if ( isPost && this.isLoading() ) {
			return translate( 'Loading…' );
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
			this.props.className, {
				'is-loading': this.isLoading()
			}
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
			siteId,
			postId
		};
	}
)( localize( EditorCategoriesTagsAccordion ) );
