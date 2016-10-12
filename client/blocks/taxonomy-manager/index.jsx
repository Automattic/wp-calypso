/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import Card from 'components/card';
import SearchCard from 'components/search-card';
import Button from 'components/button';
import TermsList from './list';
import TermFormDialog from 'blocks/term-form-dialog';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPostTypeTaxonomy } from 'state/post-types/taxonomies/selectors';

export class TaxonomyManager extends Component {
	static propTypes = {
		taxonomy: PropTypes.string,
		labels: PropTypes.object,
		postType: PropTypes.string,
	};

	static defaultProps = {
		postType: 'post'
	};

	constructor() {
		super( ...arguments );
		this.state = {
			search: null,
			termFormDialogOpened: false
		};

		this.onSearch = this.onSearch.bind( this );
	}

	closeTermFormDialog = () => {
		this.setState( { termFormDialogOpened: false } );
	}

	newTerm = () => {
		this.setState( {
			termFormDialogOpened: true,
			selectedTerm: undefined
		} );
	}

	editTerm = term => {
		this.setState( {
			termFormDialogOpened: true,
			selectedTerm: term
		} );
	}

	onSearch( searchTerm ) {
		if ( searchTerm !== this.state.search ) {
			this.setState( {
				search: searchTerm
			} );
		}
	}

	render() {
		const { search } = this.state;
		const query = {};
		if ( search && search.length ) {
			query.search = search;
		}

		return (
			<div>
				<SectionHeader label={ this.props.labels.name }>
					<Button compact primary onClick={ this.newTerm }>
						{ this.props.labels.add_new_item }
					</Button>
				</SectionHeader>
				<Card>
					<SearchCard onSearch={ this.onSearch } className="taxonomy-manager__search" />
					<TermsList query={ query } taxonomy={ this.props.taxonomy }
						onTermSelect={ this.editTerm } />
				</Card>
				<TermFormDialog
					showDialog={ this.state.termFormDialogOpened }
					onClose={ this.closeTermFormDialog }
					taxonomy={ this.props.taxonomy }
					postType={ this.props.postType }
					term={ this.state.selectedTerm }
					showDescriptionInput
				/>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const { taxonomy, postType } = ownProps;
		const siteId = getSelectedSiteId( state );
		const labels = get( getPostTypeTaxonomy( state, siteId, postType || 'post', taxonomy ), 'labels', {} );
		return { labels };
	}
)( TaxonomyManager );
