/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { cloneDeep, findIndex, map } from 'lodash';

/**
 * Internal dependencies
 */
import TermTreeSelector from 'my-sites/term-tree-selector';
import AddTerm from 'my-sites/term-tree-selector/add-term';
import { editPost } from 'state/posts/actions';
import { resetEditorTermAdded } from 'state/ui/editor/terms/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { getEditorTermAdded } from 'state/ui/editor/terms/selectors';

class EditorTermSelector extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.oneOfType( [
			PropTypes.number,
			PropTypes.string
		] ),
		postTerms: PropTypes.object,
		postType: PropTypes.string,
		taxonomyName: PropTypes.string
	};

	constructor( props ) {
		super( props );
		this.boundOnTermsChange = this.onTermsChange.bind( this );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.addedTerm && ( nextProps.addedTerm !== this.props.addedTerm ) ) {
			const { siteId, postId, taxonomyName, addedTerm } = nextProps;
			this.onTermsChange( addedTerm );
			nextProps.resetEditorTermAdded( siteId, postId, taxonomyName );
		}
	}

	onTermsChange( selectedTerm ) {
		const { postTerms, taxonomyName, siteId, postId } = this.props;
		const terms = cloneDeep( postTerms ) || {};

		// map call transforms object returned by API into an array
		const taxonomyTerms = map( terms[ taxonomyName ] ) || [];
		const existingSelectionIndex = findIndex( taxonomyTerms, { ID: selectedTerm.ID } );
		if ( existingSelectionIndex !== -1 ) {
			taxonomyTerms.splice( existingSelectionIndex, 1 );
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
		const { postType, postId, siteId, taxonomyName } = this.props;

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
				<AddTerm taxonomy={ taxonomyName } postType={ postType } postId={ postId } />
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state ) || '';

		return {
			postType: getEditedPostValue( state, siteId, getEditorPostId( state ), 'type' ),
			postTerms: getEditedPostValue( state, siteId, postId, 'terms' ),
			addedTerm: getEditorTermAdded( state, siteId, postId, ownProps.taxonomyName ),
			siteId,
			postId
		};
	},
	{ editPost, resetEditorTermAdded }
)( EditorTermSelector );
