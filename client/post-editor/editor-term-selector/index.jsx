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
import PostActions from 'lib/posts/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

class EditorTermSelector extends Component {
	static propTypes = {
		siteId: React.PropTypes.number,
		postTerms: React.PropTypes.object,
		taxonomyName: React.PropTypes.string
	};

	constructor( props ) {
		super( props );
		this.boundOnTermsChange = this.onTermsChange.bind( this );
	}

	onTermsChange( selectedTerm ) {
		const { postTerms, taxonomyName } = this.props;
		const terms = cloneDeep( postTerms ) || {};
		const taxonomyTerms = terms[ taxonomyName ];

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
		const { siteId, taxonomyName } = this.props;

		return (
			<TermTreeSelector
				analyticsPrefix="Editor"
				onChange={ this.boundOnTermsChange }
				selected={ this.getSelectedTermIds() }
				taxonomy={ taxonomyName }
				siteId={ siteId }
				multiple={ true }
			/>
		);
	}
}

export default connect( ( state ) => {
	return {
		siteId: getSelectedSiteId( state )
	};
} )( EditorTermSelector );
