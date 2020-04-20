/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { cloneDeep, findIndex, map, toArray } from 'lodash';

/**
 * Internal dependencies
 */
import TermTreeSelector from 'blocks/term-tree-selector';
import AddTerm from './add-term';
import canCurrentUser from 'state/selectors/can-current-user';
import { editPost, addTermForPost } from 'state/posts/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';

class EditorTermSelector extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		postTerms: PropTypes.object,
		taxonomyName: PropTypes.string,
		canEditTerms: PropTypes.bool,
		compact: PropTypes.bool,
	};

	constructor( props ) {
		super( props );
		this.boundOnTermsChange = this.onTermsChange.bind( this );
	}

	onAddTerm = ( term ) => {
		const { postId, taxonomyName, siteId } = this.props;
		this.props.addTermForPost( siteId, taxonomyName, term, postId );
	};

	onTermsChange( selectedTerm ) {
		const { postTerms, taxonomyName, siteId, postId } = this.props;
		const terms = cloneDeep( postTerms ) || {};

		// map call transforms object returned by API into an array
		const taxonomyTerms = toArray( terms[ taxonomyName ] );
		const existingSelectionIndex = findIndex( taxonomyTerms, { ID: selectedTerm.ID } );
		if ( existingSelectionIndex !== -1 ) {
			taxonomyTerms.splice( existingSelectionIndex, 1 );
		} else {
			taxonomyTerms.push( selectedTerm );
		}

		this.props.editPost( siteId, postId, {
			terms: {
				[ taxonomyName ]: taxonomyTerms,
			},
		} );
	}

	getSelectedTermIds() {
		const { postTerms, taxonomyName } = this.props;
		const selectedTerms = postTerms ? postTerms[ taxonomyName ] : [];
		return map( selectedTerms, 'ID' );
	}

	render() {
		const { taxonomyName, canEditTerms, compact } = this.props;

		return (
			<div>
				<TermTreeSelector
					analyticsPrefix="Editor"
					onChange={ this.boundOnTermsChange }
					selected={ this.getSelectedTermIds() }
					taxonomy={ taxonomyName }
					multiple={ true }
					compact={ compact }
				/>
				{ canEditTerms && <AddTerm taxonomy={ taxonomyName } onSuccess={ this.onAddTerm } /> }
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );

		return {
			postTerms: getEditedPostValue( state, siteId, postId, 'terms' ),
			canEditTerms: canCurrentUser( state, siteId, 'manage_categories' ),
			siteId,
			postId,
		};
	},
	{ editPost, addTermForPost }
)( EditorTermSelector );
