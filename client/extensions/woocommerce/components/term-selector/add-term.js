/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get, noop } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import TermFormDialog from 'blocks/term-form-dialog';
import QueryTaxonomies from 'components/data/query-taxonomies';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPostTypeTaxonomy } from 'state/post-types/taxonomies/selectors';

class TermSelectorAddTerm extends Component {
	static propTypes = {
		onSuccess: PropTypes.func,
		postType: PropTypes.string,
		taxonomy: PropTypes.string,
		terms: PropTypes.array,
		type: PropTypes.string,
	};

	static defaultProps = {
		onSuccess: noop,
	};

	constructor( props ) {
		super( props );
		this.state = {
			showDialog: false,
		};
	}

	openDialog = event => {
		event.preventDefault();
		this.setState( { showDialog: true } );
	};

	closeDialog = () => {
		this.setState( { showDialog: false } );
	};

	render() {
		const { siteId, onSuccess, taxonomy, labels, postType } = this.props;
		return (
			<div className="term-selector__add-term">
				{ siteId && <QueryTaxonomies { ...{ siteId, postType } } /> }
				<Button borderless compact onClick={ this.openDialog }>
					<Gridicon icon="folder" /> { labels.add_new_item }
				</Button>
				<TermFormDialog
					showDialog={ this.state.showDialog }
					onClose={ this.closeDialog }
					postType="product"
					taxonomy={ taxonomy }
					onSuccess={ onSuccess }
					showDescriptionInput
				/>
			</div>
		);
	}
}

export default connect( ( state, { postType, taxonomy } ) => {
	const siteId = getSelectedSiteId( state );
	const taxonomyDetails = getPostTypeTaxonomy( state, siteId, postType, taxonomy );
	const labels = get( taxonomyDetails, 'labels', {} );

	return {
		siteId,
		labels,
	};
} )( TermSelectorAddTerm );
