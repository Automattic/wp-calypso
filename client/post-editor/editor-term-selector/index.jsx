/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import map from 'lodash/map';
import cloneDeep from 'lodash/cloneDeep';

/**
 * Internal dependencies
 */
import TermTreeSelector from 'my-sites/term-tree-selector';
import AddTerm from 'my-sites/term-tree-selector/add-term';
import PostActions from 'lib/posts/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';

class EditorTermSelector extends Component {
	static propTypes = {
		siteId: React.PropTypes.number,
		postTerms: React.PropTypes.object,
		postType: React.PropTypes.string,
		taxonomyName: React.PropTypes.string
	};

	constructor( props ) {
		super( props );
		this.boundOnTermsChange = this.onTermsChange.bind( this );
	}

	onTermsChange( selectedTerm ) {
		const { postTerms, taxonomyName } = this.props;
		const terms = cloneDeep( postTerms ) || {};
		const taxonomyTerms = terms[ taxonomyName ] || {};

		if ( taxonomyTerms[ selectedTerm.name ] ) {
			delete taxonomyTerms[ selectedTerm.name ];
		} else {
			taxonomyTerms[ selectedTerm.name ] = selectedTerm;
		}
		terms[ taxonomyName ] = taxonomyTerms;

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.edit( {
			terms: terms
		} );
	}

	getSelectedTermIds() {
		const { postTerms, taxonomyName } = this.props;
		const selectedTerms = postTerms ? postTerms[ taxonomyName ] : [];
		return map( selectedTerms, 'ID' );
	}

	render() {
		const { postType, siteId, taxonomyName } = this.props;

		return (
			<div>
				<TermTreeSelector
					analyticsPrefix="Editor"
					onChange={ this.boundOnTermsChange }
					selected={ this.getSelectedTermIds() }
					taxonomy={ taxonomyName }
					siteId={ siteId }
					multiple={ true }
				/>
				<AddTerm taxonomy={ taxonomyName } postType={ postType } />
			</div>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		postType: getEditedPostValue( state, siteId, getEditorPostId( state ), 'type' ),
		siteId
	};
} )( EditorTermSelector );
