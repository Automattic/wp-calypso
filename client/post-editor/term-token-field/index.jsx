/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';
import _debug from 'debug';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getTerms } from 'state/terms/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { getPostTypeTaxonomy } from 'state/post-types/taxonomies/selectors';
import { editPost } from 'state/posts/actions';
import TokenField from 'components/token-field';
import { decodeEntities } from 'lib/formatting';
import { recordEditorStat, recordEditorEvent } from 'state/posts/stats';
import QueryTerms from 'components/data/query-terms';

const debug = _debug( 'calypso:post-editor:editor-terms' );
const DEFAULT_NON_HIERARCHICAL_QUERY = {
	number: 1000,
	order_by: 'count',
	order: 'DESC',
};
const MAX_TERMS_SUGGESTIONS = 20;

class TermTokenField extends React.Component {
	UNSAFE_componentWillMount() {
		this.boundOnTermsChange = this.onTermsChange.bind( this );
	}

	onTermsChange( selectedTerms ) {
		debug( 'onTermsChange', selectedTerms, this );

		let termStat, termEventLabel;
		if ( selectedTerms.length > this.getPostTerms().length ) {
			termStat = 'term_added';
			termEventLabel = 'Added Term';
		} else {
			termStat = 'term_removed';
			termEventLabel = 'Removed Term';
		}
		this.props.recordEditorStat( termStat );
		this.props.recordEditorEvent( 'Changed Terms', termEventLabel );

		const { siteId, postId, taxonomyName } = this.props;
		this.props.editPost( siteId, postId, {
			terms: {
				[ taxonomyName ]: selectedTerms,
			},
		} );
	}

	getPostTerms() {
		const { postTerms, taxonomyName } = this.props;

		if ( ! postTerms || ! postTerms[ taxonomyName ] ) {
			return [];
		}

		if ( Array.isArray( postTerms[ taxonomyName ] ) ) {
			return postTerms[ taxonomyName ];
		}

		return Object.keys( postTerms[ taxonomyName ] );
	}

	render() {
		const termNames = map( this.props.terms, 'name' );

		return (
			<div>
				<QueryTerms
					siteId={ this.props.siteId }
					taxonomy={ this.props.taxonomyName }
					query={ DEFAULT_NON_HIERARCHICAL_QUERY }
				/>
				<TokenField
					value={ this.getPostTerms() }
					displayTransform={ decodeEntities }
					suggestions={ termNames }
					onChange={ this.boundOnTermsChange }
					maxSuggestions={ MAX_TERMS_SUGGESTIONS }
				/>
			</div>
		);
	}
}

TermTokenField.propTypes = {
	siteId: PropTypes.number,
	postId: PropTypes.number,
	postTerms: PropTypes.object,
	taxonomyName: PropTypes.string,
	taxonomyLabel: PropTypes.string,
	terms: PropTypes.arrayOf( PropTypes.object ),
	editPost: PropTypes.func,
};

export default connect(
	( state, props ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );

		const postType = getEditedPostValue( state, siteId, postId, 'type' );
		const taxonomy = getPostTypeTaxonomy( state, siteId, postType, props.taxonomyName );

		return {
			siteId,
			postId,
			taxonomyLabel: taxonomy && taxonomy.label,
			terms: getTerms( state, siteId, props.taxonomyName ),
			postTerms: getEditedPostValue( state, siteId, postId, 'terms' ),
		};
	},
	{ editPost, recordEditorStat, recordEditorEvent }
)( TermTokenField );
