/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import map from 'lodash/map';

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

function EditorDrawerTaxonomies( { siteId, postType, taxonomies } ) {
	return (
		<div className="editor-drawer__taxonomies">
			{ siteId && postType && (
				<QueryTaxonomies { ...{ siteId, postType } } />
			) }
			{ map( taxonomies, ( taxonomy ) => {
				if ( 'post_format' === taxonomy.name ) {
					// Post format has its own dedicated accordion
					return;
				}

				return (
					<Accordion
						key={ taxonomy.name }
						title={ taxonomy.label }
						icon={ <Gridicon icon="tag" /> }>
						Work in Progress
					</Accordion>
				);
			} ).filter( Boolean ) }
		</div>
	);
}

EditorDrawerTaxonomies.propTypes = {
	siteId: PropTypes.number,
	postType: PropTypes.string,
	taxonomies: PropTypes.array
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
