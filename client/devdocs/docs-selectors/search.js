/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import request from 'superagent';
import page from 'page';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import SearchCard from 'components/search-card';
import { addQueryArgs } from 'lib/url';
import DocsSelectorsResult from './result';

export default class DocsSelectorsSearch extends Component {
	static propTypes = {
		search: PropTypes.string
	}

	state = {};

	componentWillMount() {
		this.request( this.props.search );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.search !== this.props.search ) {
			this.request( nextProps.search );
		}
	}

	request = ( search ) => {
		request.get( '/devdocs/service/selectors' )
			.query( { search } )
			.then( ( { body: results } ) => {
				this.setState( { results } );
			} );
	}

	onSearch( search ) {
		page( addQueryArgs( { search }, '/devdocs/selectors' ) );
	}

	render() {
		const { search } = this.props;
		const { results } = this.state;

		return (
			<div>
				<SearchCard
					autoFocus
					placeholder="Search selectors…"
					analyticsGroup="Docs"
					initialValue={ search }
					delaySearch
					onSearch={ this.onSearch } />
				{ results && ! results.length && (
					<EmptyContent
						title="No selectors found"
						line="Try another search query" />
				) }
				<ul className="docs-selectors__results">
					{ map( results, ( { name, description, tags } ) => (
						<li key={ name }>
							<DocsSelectorsResult
								{ ...{ name, description, tags } }
								url={ addQueryArgs( { search }, `/devdocs/selectors/${ name }` ) } />
						</li>
					) ) }
				</ul>
			</div>
		);
	}
}
