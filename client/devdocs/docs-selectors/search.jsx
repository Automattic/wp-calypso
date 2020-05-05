/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import page from 'page';
import { map } from 'lodash';
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import SearchCard from 'components/search-card';
import { addQueryArgs } from 'lib/url';
import DocsSelectorsResult from './result';

export default class DocsSelectorsSearch extends Component {
	static propTypes = {
		search: PropTypes.string,
	};

	state = {};

	componentDidMount() {
		this.request( this.props.search );
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.search !== this.props.search ) {
			this.request( this.props.search );
		}
	}

	request = async ( search ) => {
		const query = stringify( { search } );

		try {
			const res = await fetch( `/devdocs/service/selectors?${ query }` );
			if ( res.ok ) {
				const results = await res.json();
				this.setState( { results } );
			}
		} catch ( error ) {
			// Do nothing.
		}
	};

	onSearch( search ) {
		page( addQueryArgs( { search }, '/devdocs/selectors' ) );
	}

	render() {
		const { search } = this.props;
		const { results } = this.state;

		return (
			<div>
				<SearchCard
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus
					placeholder="Search selectors…"
					analyticsGroup="Docs"
					initialValue={ search }
					delaySearch
					onSearch={ this.onSearch }
				/>
				{ results && ! results.length && (
					<EmptyContent title="No selectors found" line="Try another search query" />
				) }
				<ul className="docs-selectors__results">
					{ map( results, ( { name, description, tags } ) => (
						<li key={ name }>
							<DocsSelectorsResult
								{ ...{ name, description, tags } }
								url={ addQueryArgs( { search }, `/devdocs/selectors/${ name }` ) }
							/>
						</li>
					) ) }
				</ul>
			</div>
		);
	}
}
