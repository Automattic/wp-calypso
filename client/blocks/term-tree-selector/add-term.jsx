/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import TermFormDialog from 'blocks/term-form-dialog';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPostTypeTaxonomy } from 'state/post-types/taxonomies/selectors';
import { getTerms } from 'state/terms/selectors';

class TermSelectorAddTerm extends Component {
	static propTypes = {
		labels: PropTypes.object,
		terms: PropTypes.array
	};

	openDialog = event => {
		event.preventDefault();
		this.refs.termDialog.openDialog();
	};

	render() {
		const { labels, terms, ...props } = this.props;
		const totalTerms = terms ? terms.length : 0;
		const classes = classNames( 'term-tree-selector__add-term', { 'is-compact': totalTerms < 8 } );

		return (
			<div className={ classes }>
				<Button borderless compact={ true } onClick={ this.openDialog }>
					<Gridicon icon="folder" /> { labels.add_new_item }
				</Button>
				<TermFormDialog refs="termDialog" { ...props } />
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const { taxonomy, postType } = ownProps;
		const siteId = getSelectedSiteId( state );
		const taxonomyDetails = getPostTypeTaxonomy( state, siteId, postType, taxonomy );
		const labels = get( taxonomyDetails, 'labels', {} );

		return {
			terms: getTerms( state, siteId, taxonomy ),
			labels
		};
	}
)( TermSelectorAddTerm );
