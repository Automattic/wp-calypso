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

	constructor( props ) {
		super( props );
		this.state = {
			showDialog: false
		};
	}

	openDialog = event => {
		event.preventDefault();
		this.setState( { showDialog: true } );
	};

	closeDialog = () => {
		this.setState( { showDialog: false } );
	}

	render() {
		const { labels, terms, ...props } = this.props;
		const totalTerms = terms ? terms.length : 0;
		const classes = classNames( 'editor-term-selector__add-term', { 'is-compact': totalTerms < 8 } );

		return (
			<div className={ classes }>
				<Button borderless compact onClick={ this.openDialog }>
					<Gridicon icon="folder" /> { labels.add_new_item }
				</Button>
				<TermFormDialog
					showDialog={ this.state.showDialog }
					onClose={ this.closeDialog }
					{ ...props }
				/>
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
