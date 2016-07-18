/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { cloneDeep, find, reject, map } from 'lodash';

/**
 * Internal dependencies
 */
import TermTreeSelector from 'my-sites/term-tree-selector';
import AddTerm from 'my-sites/term-tree-selector/add-term';
import { editPost } from 'state/posts/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';

class EditorTermSelector extends Component {
	static propTypes = {
		siteId: React.PropTypes.number,
		postId: React.PropTypes.number,
		postTerms: React.PropTypes.object,
		postType: React.PropTypes.string,
		taxonomyName: React.PropTypes.string
	};

	constructor( props ) {
		super( props );
		this.boundOnTermsChange = this.onTermsChange.bind( this );
	}

	onTermsChange( selectedTerm ) {
		const { postTerms, taxonomyName, siteId, postId } = this.props;
		const terms = cloneDeep( postTerms ) || {};

		// map call transforms object returned by API into an array
		let taxonomyTerms = map( terms[ taxonomyName ] ) || [];

		if ( find( taxonomyTerms, { ID: selectedTerm.ID } ) ) {
			taxonomyTerms = reject( taxonomyTerms, { ID: selectedTerm.ID } );
		} else {
			taxonomyTerms.push( selectedTerm );
		}

		this.props.editPost( {
			terms: {
				[ taxonomyName ]: taxonomyTerms
			}
		}, siteId, postId );
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

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );

		return {
			postType: getEditedPostValue( state, siteId, getEditorPostId( state ), 'type' ),
			postTerms: getEditedPostValue( state, siteId, postId, 'terms' ),
			siteId,
			postId
		};
	},
	{ editPost }
)( EditorTermSelector );
