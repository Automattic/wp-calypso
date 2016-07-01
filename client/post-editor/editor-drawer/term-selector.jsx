/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import without from 'lodash/without';
import isEqual from 'lodash/isEqual';
import clone from 'lodash/clone';

/**
 * Internal dependencies
 */
import TermTreeSelector from 'my-sites/term-tree-selector';
import PostActions from 'lib/posts/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

class EditorDrawerTermSelector extends Component {
	static propTypes = {
		siteId: React.PropTypes.number,
		selectedTermIds: React.PropTypes.array,
		taxonomyName: React.PropTypes.string
	};

	constructor( props ) {
		super( props );
		this.boundOnTermsChange = this.onTermsChange.bind( this );

		// This does not seem like a solid approach here
		this.state = {
			selectedIds: props.selectedTermIds
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! isEqual( nextProps.selectedTermIds, this.state.selectedIds ) ) {
			this.setState( { selectedIds: nextProps.selectedTermIds } );
		}
	}

	onTermsChange( selectedTerm ) {
		const { taxonomyName } = this.props;
		let termIds = clone( this.state.selectedIds ) || [];

		if ( -1 === termIds.indexOf( selectedTerm.ID ) ) {
			termIds.push( selectedTerm.ID );
		} else {
			termIds = without( termIds, selectedTerm.ID );
		}

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.edit( {
			terms_by_id: {
				[ taxonomyName ]: termIds
			}
		} );

		this.setState( { selectedIds: termIds } );
	}

	render() {
		const { siteId, taxonomyName } = this.props;

		return (
			<TermTreeSelector
				analyticsPrefix="Editor"
				onChange={ this.boundOnTermsChange }
				selected={ this.state.selectedIds }
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
} )( EditorDrawerTermSelector );
