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
import QueryTaxonomies from 'components/data/query-taxonomies';

export class TaxonomyManager extends Component {
	static propTypes = {
		taxonomy: PropTypes.string,
		labels: PropTypes.object,
		postType: PropTypes.string,
		siteId: PropTypes.number,
	};

	static defaultProps = {
		postType: 'post'
	};

	constructor( props ) {
		super( props );
		this.state = {
			search: null
		};

		this.onSearch = this.onSearch.bind( this );
	}

	onSearch = searchTerm => {
		if ( searchTerm !== this.state.search ) {
			this.setState( {
				search: searchTerm
			} );
		}
	}

	render() {
		const { search } = this.state;
		const { siteId, postType, labels, taxonomy } = this.props;
		const query = {};
		if ( search && search.length ) {
			query.search = search;
		}

		return (
			<div>
				{ siteId && <QueryTaxonomies { ...{ siteId, postType } } /> }
				<SectionHeader label={ labels.name }>
					<Button compact primary>
						{ labels.add_new_item }
					</Button>
				</SectionHeader>
				<Card>
					<SearchCard onSearch={ this.onSearch } className="taxonomy-manager__search" />
					<TermsList query={ query } taxonomy={ taxonomy } />
				</Card>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const { taxonomy, postType } = ownProps;
		const siteId = getSelectedSiteId( state );
		const labels = get( getPostTypeTaxonomy( state, siteId, postType, taxonomy ), 'labels', {} );
		return { labels, siteId };
	}
)( TaxonomyManager );
