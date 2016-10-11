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
			search: null
		};

		this.onSearch = this.onSearch.bind( this );
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
					<Button compact primary>
						{ this.props.labels.add_new_item }
					</Button>
				</SectionHeader>
				<Card>
					<SearchCard onSearch={ this.onSearch } className="taxonomy-manager__search" />
					<TermsList query={ query } taxonomy={ this.props.taxonomy } />
				</Card>
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
