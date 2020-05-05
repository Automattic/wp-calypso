/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, toArray, unescape as unescapeString } from 'lodash';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import AccordionSection from 'components/accordion/section';
import EditorDrawerLabel from 'post-editor/editor-drawer/label';
import TermSelector from 'post-editor/editor-term-selector';
import TermTokenField from 'post-editor/term-token-field';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { getSiteOption } from 'state/sites/selectors';
import { getTerm } from 'state/terms/selectors';

/**
 * Style dependencies
 */
import './style.scss';

export class EditorCategoriesTagsAccordion extends Component {
	static propTypes = {
		translate: PropTypes.func,
		postTerms: PropTypes.object,
		postType: PropTypes.string,
		defaultCategory: PropTypes.object,
	};

	renderCategories() {
		const { translate, postType } = this.props;
		if ( postType === 'page' ) {
			return;
		}

		return (
			<AccordionSection>
				<EditorDrawerLabel
					helpText={ translate( 'Use categories to group your posts by topic.' ) }
					labelText={ translate( 'Categories' ) }
				/>
				<TermSelector compact taxonomyName="category" />
			</AccordionSection>
		);
	}

	renderTags() {
		const { postType, translate } = this.props;
		const helpText =
			postType === 'page'
				? translate( 'Use tags to associate more specific keywords with your pages.' )
				: translate( 'Use tags to associate more specific keywords with your posts.' );

		return (
			<AccordionSection>
				<EditorDrawerLabel helpText={ helpText } labelText={ translate( 'Tags' ) } />
				<TermTokenField taxonomyName="post_tag" />
			</AccordionSection>
		);
	}

	getCategoriesSubtitle() {
		const { translate, postTerms, defaultCategory } = this.props;
		const categories = toArray( get( postTerms, 'category' ) );

		if ( categories.length > 1 ) {
			return translate( '%d category', '%d categories', {
				args: [ categories.length ],
				count: categories.length,
			} );
		}

		let category;
		if ( categories.length > 0 ) {
			category = categories[ 0 ];
		} else {
			category = defaultCategory;
		}

		if ( category ) {
			return unescapeString( category.name );
		}
	}

	getTagsSubtitle() {
		const { translate, postTerms } = this.props;
		const tags = toArray( get( postTerms, 'post_tag' ) );
		const tagsLength = tags.length;

		switch ( tagsLength ) {
			case 0:
				return null; // No tags subtitle
			case 1:
			case 2:
				return tags
					.map( ( tag ) => {
						return '#' + unescapeString( tag.name || tag );
					} )
					.join( ', ' );
			default:
				return translate( '%d tag', '%d tags', { args: [ tagsLength ], count: tagsLength } );
		}
	}

	getSubtitle() {
		const subtitlePieces = [];
		const { postType, siteId } = this.props;

		if ( ! siteId ) {
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
				className={ classes }
				e2eTitle="categories-tags"
			>
				{ this.renderCategories() }
				{ this.renderTags() }
			</Accordion>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const defaultCategoryId = getSiteOption( state, siteId, 'default_category' );

	return {
		defaultCategory: getTerm( state, siteId, 'category', defaultCategoryId ),
		postTerms: getEditedPostValue( state, siteId, postId, 'terms' ),
		postType: getEditedPostValue( state, siteId, postId, 'type' ),
		siteId,
		postId,
	};
} )( localize( EditorCategoriesTagsAccordion ) );
