/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { reduce, includes } from 'lodash';

/**
 * Internal dependencies
 */
import QueryTaxonomies from 'components/data/query-taxonomies';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { getPostTypeTaxonomies } from 'state/post-types/taxonomies/selectors';
import Accordion from 'components/accordion';
import Gridicon from 'components/gridicon';
import TermTokenField from 'post-editor/term-token-field';
import TermSelector from 'post-editor/editor-term-selector';

function isSkippedTaxonomy( postType, taxonomy ) {
	if ( includes( [ 'post_format', 'mentions' ], taxonomy ) ) {
		return true;
	}

	if ( 'post' === postType ) {
		return includes( [ 'category', 'post_tag' ], taxonomy );
	}

	return false;
}

function EditorDrawerTaxonomies( { siteId, postType, postTerms, taxonomies } ) {
	return (
		<div className="editor-drawer__taxonomies">
			{ siteId && postType && (
				<QueryTaxonomies { ...{ siteId, postType } } />
			) }
			{ reduce( taxonomies, ( memo, taxonomy ) => {
				const { name, label, hierarchical } = taxonomy;

				if ( isSkippedTaxonomy( postType, name ) ) {
					return memo;
				}

				const icon = hierarchical ? 'folder' : 'tag';

				return memo.concat(
					<Accordion
						key={ name }
						title={ label }
						icon={ <Gridicon icon={ icon } /> }
					>
					{ hierarchical
						? <TermSelector taxonomyName={ name } />
						: <TermTokenField taxonomyName={ name } />
					}
					</Accordion>
				);
			}, [] ) }
		</div>
	);
}

EditorDrawerTaxonomies.propTypes = {
	siteId: PropTypes.number,
	postType: PropTypes.string,
	taxonomies: PropTypes.array,
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const postType = getEditedPostValue( state, siteId, getEditorPostId( state ), 'type' );

	return {
		siteId,
		postType,
		taxonomies: getPostTypeTaxonomies( state, siteId, postType )
	};
} )( EditorDrawerTaxonomies );
