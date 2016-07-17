/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { includes, cloneDeep, map } from 'lodash';

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
		let taxonomyTerms = map( terms[ taxonomyName ] );
		const termIds = map( taxonomyTerms, 'ID' );

		if ( includes( termIds, selectedTerm.ID ) ) {
			taxonomyTerms = taxonomyTerms.reduce( ( prev, term ) => {
				if ( term.ID === selectedTerm.ID ) {
					return prev;
				}

				prev.push( term );
				return prev;
			}, [] );
		} else {
			taxonomyTerms.push( selectedTerm );
		}

		const taxonomyTermIds = map( taxonomyTerms, 'ID' );

		this.props.editPost( {
			terms: {
				[ taxonomyName ]: taxonomyTerms
			},
			terms_by_id: {
				[ taxonomyName ]: taxonomyTermIds.length ? taxonomyTermIds : null
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
